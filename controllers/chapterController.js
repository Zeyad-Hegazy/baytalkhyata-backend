const fs = require("fs");
const path = require("path");

const Chapter = require("../models/ChapterModel");
const Diploma = require("../models/DiplomaModel");
const Student = require("../models/StudentModel");
const Level = require("../models/LevelModel");
const Section = require("../models/SectionModel");
const Item = require("../models/ItemModel");

const ApiError = require("../util/ApiError");

const { saveAndDeleteVideo } = require("../util/videoUtility");
const { saveAndDeleteAudio } = require("../util/audioUtility");
const { saveAndDeleteImage } = require("../util/imageUtil");
const { saveAndDeletePdfFS } = require("../util/pdfUtility");

const Answer = require("../models/AnswerModel");
const Question = require("../models/QuestionModel");
const Quiz = require("../models/QuizModel");

exports.createChapter = async (req, res, next) => {
	const { title, diploma } = req.body;

	try {
		const newChapter = await Chapter.create({ title, diploma });

		await Diploma.findByIdAndUpdate(
			diploma,
			{
				$push: { chapters: newChapter._id },
			},
			{ new: true }
		);
		return res.status(201).json({
			status: "success",
			result: {
				_id: newChapter._id,
				title: newChapter.title,
			},
			success: true,
			message: "new chapter created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.addLevelToChapter = async (req, res, next) => {
	try {
		const { chapterId } = req.params;
		const { title, order, sections } = req.body;

		if (!title || !sections || !Array.isArray(sections)) {
			return next(new ApiError("Invalid input data", 400));
		}

		const level = await Level.create({
			title,
			chapter: chapterId,
			order,
		});

		await Chapter.findByIdAndUpdate(chapterId, {
			$push: { levels: level._id },
		});

		const sectionPromises = sections.map(async (sectionData, index) => {
			const newSection = await Section.create({
				title: sectionData.title,
				level: level._id,
				order: sectionData.order || index + 1,
			});

			if (sectionData.items && Array.isArray(sectionData.items)) {
				const itemPromises = sectionData.items.map(async (itemData) => {
					let fileUrl;

					switch (itemData.type) {
						case "video":
							fileUrl = await saveAndDeleteVideo(
								null,
								itemData.fileBuffer,
								"videos"
							);
							break;
						case "audio":
							fileUrl = await saveAndDeleteAudio(
								null,
								itemData.fileBuffer,
								"audios"
							);
							break;
						case "image":
							fileUrl = await saveAndDeleteImage(
								null,
								itemData.fileBuffer,
								"images"
							);
							break;
						case "pdf":
							fileUrl = await saveAndDeletePdfFS(
								null,
								itemData.fileBuffer,
								"pdfs"
							);
							break;
						case "text":
							fileUrl = itemData.fileContent;
							break;
						default:
							return next(new ApiError("Unsupported item type", 400));
					}

					const newItem = await Item.create({
						...itemData,
						file: fileUrl,
						section: newSection._id,
					});

					return newItem;
				});

				const createdItems = await Promise.all(itemPromises);
				newSection.items = createdItems.map((item) => item._id);
			}

			if (sectionData.quizes && Array.isArray(sectionData.quizes)) {
				// TODO handle create quizes here later
				newSection.quizes = sectionData.quizes;
			}

			await newSection.save();
			return newSection;
		});

		const createdSections = await Promise.all(sectionPromises);

		level.sections = createdSections.map((section) => section._id);
		await level.save();

		res.status(201).json({
			status: "success",
			result: level,
			success: true,
			message: "new level created successfully",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error, 500));
	}
};

// exports.addLevelToChapter = async (req, res, next) => {
// 	const { chapterId } = req.params;
// 	const { level, video, audio, image, pdf, text } = req.body;

// 	try {
// 		const newLevel = [];

// 		if (video.base64) {
// 			const uploadedVideo = await saveAndDeleteVideo(
// 				null,
// 				video.base64,
// 				"videos"
// 			);
// 			newLevel.push({
// 				type: "video",
// 				file: uploadedVideo,
// 				points: video.points,
// 			});
// 		}

// 		if (audio.base64) {
// 			const uploadedAudio = await saveAndDeleteAudio(
// 				null,
// 				audio.base64,
// 				"audios"
// 			);
// 			newLevel.push({
// 				type: "audio",
// 				file: uploadedAudio,
// 				points: audio.points,
// 			});
// 		}

// 		if (image.base64) {
// 			const uploadedImage = await saveAndDeleteImage(null, image.base64);
// 			newLevel.push({
// 				type: "image",
// 				file: uploadedImage,
// 				points: image.points,
// 			});
// 		}

// 		if (pdf.base64) {
// 			const uploadedPdf = await saveAndDeletePdfFS(null, pdf.base64, "pdfs");
// 			newLevel.push({
// 				type: "pdf",
// 				file: uploadedPdf,
// 				points: pdf.points,
// 			});
// 		}

// 		if (text.text) {
// 			newLevel.push({
// 				type: "text",
// 				file: text.text,
// 				points: text.points,
// 			});
// 		}

// 		const levelField = `level${level}`;
// 		const updatedChapter = await Chapter.findByIdAndUpdate(
// 			chapterId,
// 			{
// 				$push: { [levelField]: { $each: newLevel } },
// 			},
// 			{ new: true }
// 		);

// 		if (!updatedChapter) {
// 			return next(new ApiError("Chapter not found", 404));
// 		}

// 		return res.status(201).json({
// 			status: "success",
// 			result: updatedChapter,
// 			success: true,
// 			message: `Level ${level} created successfully`,
// 		});
// 	} catch (error) {
// 		return next(new ApiError(`Something went wrong: ${error.message}`, 500));
// 	}
// };

exports.createQuizLevel = async (req, res, next) => {
	const { title, chapter, questions, totalScore, passedScore } = req.body;

	try {
		const questionPromises = questions.map(async (question) => {
			const answerPromises = question.answers.map(async (answer) => {
				const newAnswer = await Answer.create({
					text: answer.text,
					isCorrect: answer.isCorrect,
				});
				return newAnswer._id;
			});

			const answerIds = await Promise.all(answerPromises);

			const newQuestion = await Question.create({
				text: question.text,
				answers: answerIds,
				score: question.score,
			});

			return newQuestion._id;
		});

		const questionIds = await Promise.all(questionPromises);

		const newQuiz = await Quiz.create({
			title,
			chapter,
			questions: questionIds,
			totalScore,
			passedScore,
		});

		await Chapter.findByIdAndUpdate(
			chapter,
			{ levelFive: newQuiz._id },
			{ new: true }
		);

		return res.status(201).json({
			status: "success",
			result: newQuiz,
			success: true,
			message: "Quiz created successfully",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error, 500));
	}
};

// Student Mobile

// NEW
exports.getChapters = async (req, res, next) => {
	try {
		const { diplomaId } = req.params;

		const diploma = await Diploma.findById(diplomaId)
			.select("title description chapters")
			.populate({
				path: "chapters",
				select: "title",
			});

		if (!diploma) {
			return res.status(404).json({ message: "Diploma not found" });
		}

		res.status(200).json({
			status: "success",
			result: diploma,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getChapterLevels = async (req, res, next) => {
	try {
		const { chapterId } = req.params;

		const chapter = await Chapter.findById(chapterId)
			.select("title levels")
			.populate({
				path: "levels",
				select: "title order",
				options: { sort: { order: 1 } },
			});

		if (!chapter) {
			return res.status(404).json({ message: "Chapter not found" });
		}

		res.status(200).json({
			status: "success",
			result: chapter,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getLevelSections = async (req, res, next) => {
	try {
		const { levelId } = req.params;

		const level = await Level.findById(levelId)
			.select("title order sections")
			.populate({
				path: "sections",
				select: "title order items",
				options: { sort: { order: 1 } },
				populate: {
					path: "items",
					select: "title order type points",
					options: { sort: { order: 1 } },
				},
			});

		if (!level) {
			return res.status(404).json({ message: "Level not found" });
		}

		res.status(200).json({
			status: "success",
			result: level,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getSectionItem = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		const item = await Item.findById(itemId).select(
			"title description type file size points"
		);

		if (!item) {
			return res.status(404).json({ message: "Item not found" });
		}

		const fileExtension = item.file.split(".").pop().toLowerCase();
		let folder;

		if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
			folder = "images";
		} else if (["pdf"].includes(fileExtension)) {
			folder = "pdfs";
		} else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
			folder = "audios";
		} else if (["mp4", "avi", "mov", "mkv"].includes(fileExtension)) {
			folder = "videos";
		} else {
			return item;
		}
		let fileUrl;
		if (folder) {
			fileUrl = `${res.locals.baseUrl}/uploads/${folder}/${item.file}`;
		} else {
			fileUrl = item.file;
		}

		res.status(200).json({
			status: "success",
			result: {
				_id: item._id,
				title: item.title,
				description: item.description,
				type: item.type,
				file: fileUrl,
				size: item.size,
				points: item.points,
			},
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.completeItem = async (req, res, next) => {
	try {
		const { itemId } = req.params;
		const studentId = req.user._id;

		const student = await Student.findById(studentId);
		const item = await Item.findById(itemId);
		const section = await Section.findById(item.section);
		const level = await Level.findById(section.level);
		const chapter = await Chapter.findById(level.chapter);

		const diploma = student?.enrolledDiplomas.find(
			(enrolledDiploma) =>
				enrolledDiploma.diploma.toString() === chapter.diploma.toString()
		);

		if (!diploma) {
			return res.status(404).json({ message: "Diploma not found" });
		}

		let completedLevel = diploma.completedLevels.find(
			(cl) => cl.level.toString() === level._id.toString()
		);

		if (completedLevel) {
			let completedSection = completedLevel.completedSections.find(
				(cs) => cs.section.toString() === section._id.toString()
			);

			if (completedSection) {
				if (!completedSection.completedItems.includes(item._id)) {
					completedSection.completedItems.push(item._id);
					diploma.totalPointsEarned += item.points || 0;
				}
			} else {
				completedLevel.completedSections.push({
					section: section._id,
					completedItems: [item._id],
				});
				diploma.totalPointsEarned += item.points || 0;
			}
		} else {
			diploma.completedLevels.push({
				level: level._id,
				completedSections: [
					{
						section: section._id,
						completedItems: [item._id],
					},
				],
			});
			diploma.totalPointsEarned += item.points || 0;
		}

		await student.save();

		res.status(200).json({
			status: "success",
			result: {
				diploma,
			},
			success: true,
			message: "Item marked as complete, points updated",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// OLD
exports.getChapterLevel = async (req, res) => {
	try {
		const { chapterId, levelType } = req.params;

		const chapter = await Chapter.findById(chapterId).exec();

		if (!chapter) {
			return res.status(404).json({ message: "Chapter not found" });
		}

		let levelArray;
		switch (levelType) {
			case "levelOne":
				levelArray = chapter.levelOne;
				break;
			case "levelTwo":
				levelArray = chapter.levelTwo;
				break;
			case "levelThree":
				levelArray = chapter.levelThree;
				break;
			case "levelFour":
				levelArray = chapter.levelFour;
				break;
			default:
				return res.status(400).json({ message: "Invalid level type" });
		}

		const updatedLevelArray = levelArray.map((item) => {
			if (item.file) {
				const fileExtension = item.file.split(".").pop().toLowerCase();
				let folder;

				if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
					folder = "images";
				} else if (["pdf"].includes(fileExtension)) {
					folder = "pdfs";
				} else if (["mp3", "wav", "ogg"].includes(fileExtension)) {
					folder = "audios";
				} else if (["mp4", "avi", "mov", "mkv"].includes(fileExtension)) {
					folder = "videos";
				} else {
					return item;
				}

				return {
					...item._doc,
					file: `${res.locals.baseUrl}/uploads/${folder}/${item.file}`,
				};
			}
			return item;
		});

		res.status(200).json({
			status: "success",
			result: updatedLevelArray,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.getQuizLevel = async (req, res, next) => {
	try {
		const { chapterId } = req.params;

		const chapter = await Chapter.findById(chapterId).populate({
			path: "levelFive",
			model: "Quiz",
			select: "title chapter questions totalScore",
			populate: {
				path: "questions",
				model: "Question",
				select: "text score answers",
				populate: {
					path: "answers",
					model: "Answer",
					select: "text",
				},
			},
		});

		if (!chapter) {
			return res.status(404).json({ message: "Chapter not found" });
		}

		res.status(200).json({
			status: "success",
			result: chapter.levelFive,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.completeLevel = async (req, res, next) => {
	try {
		const { diplomaId, chapterId, levelType } = req.params;
		const studentId = req.user._id;

		const student = await Student.findById(studentId)
			.select("enrolledDiplomas")
			.populate({
				path: "enrolledDiplomas.diploma",
				model: "Diploma",
				select: "chapters",
				populate: {
					path: "chapters",
					model: "Chapter",
					select: `levelIds.${levelType} ${levelType}`,
				},
			});
		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const enrolledDiploma = student.enrolledDiplomas.find(
			(diploma) => diploma.diploma._id.toString() === diplomaId
		);

		if (!enrolledDiploma) {
			return res.status(404).json({ message: "Enrolled diploma not found" });
		}

		const completedChapter = enrolledDiploma.completedLevels.find(
			(level) => level.chapterId.toString() === chapterId
		);

		const currentChapter = enrolledDiploma.diploma.chapters.find(
			(chapter) => chapter._id.toString() === chapterId
		);

		// return res.status(200).json(currentChapter);

		if (completedChapter) {
			completedChapter.levelIds[levelType] = currentChapter.levelIds[levelType];
		} else {
			enrolledDiploma.completedLevels.push({
				chapterId,
				levelIds: { [levelType]: currentChapter.levelIds[levelType] },
			});
		}

		let totalPoints = 0;
		for (const level of currentChapter[levelType]) {
			totalPoints += level.points;
		}

		enrolledDiploma.totalPointsEarned = totalPoints;
		student.points = totalPoints;

		await student.save();

		return res
			.status(200)
			.json({ message: "Level completed successfully", student });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "An error occurred while completing the level" });
	}
};

exports.submitAnswer = async (req, res, next) => {
	try {
		const { answerId, quizId } = req.params;
		const studentId = req.user._id;

		const selectedAnswer = await Answer.findById(answerId);
		if (!selectedAnswer) {
			return res.status(404).json({ message: "Answer not found" });
		}

		const student = await Student.findById(studentId).populate({
			path: "quizesTaken",
		});

		const question = await Question.findOne({ answers: { $in: answerId } });

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		let quizTaken = student.quizesTaken.find(
			(quiz) => quiz.quiz.toString() === quizId
		);

		if (!quizTaken) {
			const isCorrectAnswer = selectedAnswer.isCorrect;
			quizTaken = {
				quiz: quizId,
				correctAnswers: isCorrectAnswer ? 1 : 0,
				submetedAnswers: [answerId],
				score: isCorrectAnswer ? question.score : 0,
				passed: false,
			};
			student.quizesTaken.push(quizTaken);
		} else {
			if (selectedAnswer.isCorrect) {
				quizTaken.correctAnswers += 1;
				quizTaken.score += question.score;
				quizTaken.submetedAnswers.push(answerId);
			}
		}

		await student.save();

		return res.status(200).json({
			message: "Answer submitted successfully",
			isCorrect: selectedAnswer.isCorrect,
			totalCorrectAnswers: quizTaken.correctAnswers,
			totalPoints: student.points,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "An error occurred while submitting the answer" });
	}
};

exports.finishQuiz = async (req, res, next) => {
	try {
		const { quizId, chapterId, diplomaId } = req.params;
		const studentId = req.user._id;

		const student = await Student.findById(studentId).populate([
			{ path: "quizesTaken.quiz" },
			{ path: "enrolledDiplomas.diploma" },
		]);

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const enrolledDiploma = student.enrolledDiplomas.find(
			(diploma) => diploma.diploma._id.toString() === diplomaId
		);

		if (!enrolledDiploma) {
			return res.status(404).json({ message: "Enrolled diploma not found" });
		}

		const quiz = await Quiz.findById(quizId).select("passedScore totalScore");
		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		let quizTaken = student.quizesTaken.find(
			(quizEntry) => quizEntry.quiz._id.toString() === quizId
		);

		if (!quizTaken) {
			return res.status(404).json({ message: "Quiz not taken" });
		}

		if (quizTaken.score >= quiz.passedScore) {
			enrolledDiploma.completedChapters.push(chapterId);
			quizTaken.passed = true;
		} else {
			return res.status(400).json({ message: "Quiz not passed" });
		}

		await student.save();

		return res.status(200).json({
			message: "Quiz finished successfully",
			passed: quizTaken.passed,
			totalCorrectAnswers: quizTaken.correctAnswers,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "Server error", error: error.message });
	}
};

// Controller to stream all files from one level of a chapter

// Controller to stream all files from one level of a chapter

// exports.streamChapterLevelFiles = async (req, res) => {
// 	try {
// 		const { chapterId, levelType, fileType } = req.params;

// 		// Fetch the chapter by ID
// 		const chapter = await Chapter.findById(chapterId).exec();

// 		// Check if chapter exists
// 		if (!chapter) {
// 			return res.status(404).json({ message: "Chapter not found" });
// 		}

// 		// Determine the correct level array
// 		let levelArray;
// 		switch (levelType) {
// 			case "levelOne":
// 				levelArray = chapter.levelOne;
// 				break;
// 			case "levelTwo":
// 				levelArray = chapter.levelTwo;
// 				break;
// 			case "levelThree":
// 				levelArray = chapter.levelThree;
// 				break;
// 			case "levelFour":
// 				levelArray = chapter.levelFour;
// 				break;
// 			default:
// 				return res.status(400).json({ message: "Invalid level type" });
// 		}

// 		// Filter the files based on the file type provided in params
// 		const files = levelArray.filter((item) => item.type === fileType);

// 		// Check if no files were found of the specified type
// 		if (files.length === 0) {
// 			return res
// 				.status(404)
// 				.json({ message: `No valid files of type ${fileType} to stream` });
// 		}

// 		// Assuming there's only one file type requested, set the content type accordingly
// 		let contentType;
// 		switch (fileType) {
// 			case "video":
// 				contentType = "video/mp4"; // Adjust based on your actual video format
// 				break;
// 			case "pdf":
// 				contentType = "application/pdf";
// 				break;
// 			case "image":
// 				contentType = "image/jpeg"; // Adjust format as needed
// 				break;
// 			case "audio":
// 				contentType = "audio/mpeg"; // Adjust format as needed
// 				break;
// 			case "text":
// 				contentType = "text/plain"; // Adjust if your text has a different format
// 				break;
// 			default:
// 				return res.status(400).json({ message: "Unsupported file type" });
// 		}

// 		// Stream each file to the client
// 		files.forEach((file) => {
// 			if (file.type === "text") {
// 				return res.status(200).json({ result: file.file });
// 			}

// 			const filePath = path.resolve(
// 				__dirname,
// 				"../uploads",
// 				file.type + "s",
// 				file.file
// 			);

// 			// Check if file exists
// 			if (!fs.existsSync(filePath)) {
// 				return res
// 					.status(404)
// 					.json({ message: `File not found: ${file.file}` });
// 			}

// 			// Set content type and stream the file
// 			res.setHeader("Content-Type", contentType);
// 			const fileStream = fs.createReadStream(filePath);
// 			fileStream.pipe(res);

// 			// Handle stream errors
// 			fileStream.on("error", (error) => {
// 				res
// 					.status(500)
// 					.json({ message: "Error streaming file", error: error.message });
// 			});
// 		});
// 	} catch (error) {
// 		// General error handling
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

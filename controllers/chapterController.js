const fs = require("fs");
const path = require("path");

const Chapter = require("../models/ChapterModel");
const Diploma = require("../models/DiplomaModel");
const Student = require("../models/StudentModel");
const Level = require("../models/LevelModel");
const Section = require("../models/SectionModel");
const Item = require("../models/ItemModel");

const ApiError = require("../util/ApiError");
const deleteFile = require("../util/deleteFile");

const { saveAndDeleteVideo } = require("../util/videoUtility");
const { saveAndDeleteAudio } = require("../util/audioUtility");
const { saveAndDeleteImage } = require("../util/imageUtil");
const { saveAndDeletePdfFS } = require("../util/pdfUtility");

const Answer = require("../models/AnswerModel");
const Question = require("../models/QuestionModel");
const Quiz = require("../models/QuizModel");

const itemQueue = require("../queues/itemQueue");

const multer = require("multer");

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
				levels: newChapter.levels,
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
		const { title, order } = req.body;

		if (!title || !order) {
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

		const newSection = await Section.create({
			title: "Section 1",
			level: level._id,
			order: 1,
		});

		level.sections = [newSection._id];
		await level.save();

		res.status(201).json({
			status: "success",
			result: level,
			success: true,
			message: "New level created",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error, 500));
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
});

// with queue
exports.addItemToLevel = [
	upload.single("file"),
	async (req, res, next) => {
		try {
			const { levelId } = req.params;
			const { title, type, points, description, size } = req.body;
			const fileBuffer = req.file?.buffer;

			if (!fileBuffer) {
				return next(new ApiError("File is required", 400));
			}

			const newItem = await Item.create({
				title,
				type,
				points,
				description,
				size,
				file: null,
				section: null,
			});

			itemQueue
				.add(
					{
						itemId: newItem._id,
						levelId,
						fileBuffer: fileBuffer.toString("base64"),
					},
					{
						attempts: 3,
						backoff: 5000,
						removeOnComplete: true,
						removeOnFail: false,
					}
				)
				.catch((err) => console.error("Queue Error:", err));

			res.status(201).json({
				status: "success",
				success: true,
				result: {
					_id: newItem._id,
					title: newItem.title,
					type: newItem.type,
					points: newItem.points,
					file: newItem.file,
					size: newItem.size,
					description: newItem.description,
					isUploaded: false,
				},
				message: "Item is being processed in the background.",
			});
		} catch (error) {
			console.error("Error adding item to level:", error);
			return next(new ApiError("Something went wrong: " + error.message, 500));
		}
	},
];

// without queue
// exports.addItemToLevel = async (req, res, next) => {
// 	try {
// 		const { levelId } = req.params;
// 		const { item } = req.body;

// 		if (!item) {
// 			return next(new ApiError("Invalid input data, item is required", 400));
// 		}

// 		const section = await Section.findOne({ level: levelId });
// 		if (!section) {
// 			return next(new ApiError("Section not found", 404));
// 		}

// 		let fileUrl;
// 		switch (item.type) {
// 			case "video":
// 				fileUrl = await saveAndDeleteVideo(null, item.fileBuffer, "videos");
// 				break;
// 			case "audio":
// 				fileUrl = await saveAndDeleteAudio(null, item.fileBuffer, "audios");
// 				break;
// 			case "image":
// 				fileUrl = await saveAndDeleteImage(null, item.fileBuffer, "images");
// 				break;
// 			case "pdf":
// 				fileUrl = await saveAndDeletePdfFS(null, item.fileBuffer, "pdfs");
// 				break;
// 			case "text":
// 				fileUrl = item.fileContent;
// 				break;
// 			default:
// 				return next(new ApiError("Unsupported item type", 400));
// 		}

// 		const newItem = await Item.create({
// 			...item,
// 			file: fileUrl,
// 			section: section._id,
// 		});

// 		section.items.push(newItem._id);
// 		await section.save();

// 		res.status(200).json({
// 			status: "success",
// 			result: newItem,
// 			success: true,
// 			message: "Item added to level successfully",
// 		});
// 	} catch (error) {
// 		return next(new ApiError("Something went wrong: " + error, 500));
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
			{ finalQuiz: newQuiz._id },
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

exports.addQuizToSection = async (req, res, next) => {
	const { title, section, questions, totalScore, passedScore } = req.body;

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
			section,
			questions: questionIds,
			totalScore,
			passedScore,
		});

		await Section.findByIdAndUpdate(
			section,
			{ $push: { quizes: newQuiz._id } },
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

exports.getDiplomaChapters = async (req, res, next) => {
	try {
		const { diplomaId } = req.params;

		const chapters = await Chapter.find({ diploma: diplomaId }).select("title");

		res.status(200).json({
			status: "success",
			result: chapters,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

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

exports.getLevelItems = async (req, res, next) => {
	try {
		const { levelId } = req.params;

		const level = await Level.findById(levelId)
			.select("title order sections")
			.populate({
				path: "sections",
				select: "items",
				populate: {
					path: "items",
					select: "title order type points file size description isUploaded",
					options: { sort: { order: 1 } },
				},
			});

		if (!level) {
			return res.status(404).json({ message: "Level not found" });
		}

		const items = level.sections.flatMap((section) =>
			section.items.map((item) => ({
				...item.toObject(),
			}))
		);

		items.sort((a, b) => a.order - b.order);

		res.status(200).json({
			status: "success",
			result: items,
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

exports.getSectionQuiz = async (req, res, next) => {
	try {
		const { quizId } = req.params;

		const quiz = await Quiz.findById(quizId)
			.select("title questions totalScore")
			.populate({
				path: "questions",
				model: "Question",
				select: "text score answers",
				populate: {
					path: "answers",
					model: "Answer",
					select: "text",
				},
			});

		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		res.status(200).json({
			status: "success",
			result: quiz,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.submitAnswer = async (req, res, next) => {
	try {
		const { answerId, quizId } = req.body;
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

exports.finishSectionQuiz = async (req, res, next) => {
	try {
		const { quizId } = req.params;
		const studentId = req.user._id;

		const student = await Student.findById(studentId).populate([
			{ path: "quizesTaken.quiz" },
		]);

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
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
		await student.updateTotalPoints();

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

exports.getQuizLevel = async (req, res, next) => {
	try {
		const { chapterId } = req.params;

		const chapter = await Chapter.findById(chapterId).populate({
			path: "finalQuiz",
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
			result: chapter.finalQuiz,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.finishFinalQuiz = async (req, res, next) => {
	try {
		const { quizId } = req.params;
		const studentId = req.user._id;

		const quiz = await Quiz.findById(quizId)
			.select("passedScore totalScore chapter")
			.populate({ path: "chapter", select: "diploma" });
		if (!quiz) {
			return res.status(404).json({ message: "Quiz not found" });
		}

		const student = await Student.findById(studentId).populate([
			{ path: "quizesTaken.quiz" },
			{ path: "enrolledDiplomas.diploma" },
		]);

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const enrolledDiploma = student.enrolledDiplomas.find(
			(diploma) =>
				diploma.diploma._id.toString() === quiz.chapter.diploma.toString()
		);

		if (!enrolledDiploma) {
			return res.status(404).json({ message: "Enrolled diploma not found" });
		}

		let quizTaken = student.quizesTaken.find(
			(quizEntry) => quizEntry.quiz._id.toString() === quizId
		);

		if (!quizTaken) {
			return res.status(404).json({ message: "Quiz not taken" });
		}

		if (quizTaken.score >= quiz.passedScore) {
			enrolledDiploma.completedChapters.push(quiz.chapter._id);
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

exports.deleteLevelItem = async (req, res, next) => {
	try {
		const { itemId } = req.params;

		if (!itemId) {
			return res
				.status(400)
				.json({ success: false, message: "Item ID is required." });
		}

		const item = await Item.findById(itemId);
		if (!item) {
			return res
				.status(404)
				.json({ success: false, message: "Item not found." });
		}

		if (item.file) {
			const folderMap = {
				video: "videos",
				pdf: "pdfs",
				image: "images",
				audio: "audios",
			};

			const folder = folderMap[item.type];
			if (folder) {
				await deleteFile(item.file, folder);
			} else {
				console.error(`No folder mapping found for type: ${item.type}`);
			}
		}

		await item.deleteOne();

		return res
			.status(200)
			.json({ success: true, message: "Item deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

exports.deleteLevel = async (req, res, next) => {
	try {
		const { levelId } = req.params;

		if (!levelId) {
			return res
				.status(400)
				.json({ success: false, message: "Level ID is required." });
		}

		const level = await Level.findById(levelId);
		if (!level) {
			return res
				.status(404)
				.json({ success: false, message: "Level not found." });
		}

		const sections = await Section.find({ _id: { $in: level.sections } });

		for (const section of sections) {
			for (const itemId of section.items) {
				const item = await Item.findById(itemId);
				if (item) {
					if (item.file) {
						const folderMap = {
							video: "videos",
							pdf: "pdfs",
							image: "images",
							audio: "audios",
						};

						const folder = folderMap[item.type];
						if (folder) {
							await deleteFile(item.file, folder);
						}
					}

					await item.deleteOne();
				}
			}

			await section.deleteOne();
		}

		await level.deleteOne();

		return res.status(200).json({
			success: true,
			message: "Level and all associated items deleted successfully.",
		});
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
};

exports.deleteChapter = async (req, res, next) => {
	try {
		const { chapterId } = req.params;

		if (!chapterId) {
			return res
				.status(400)
				.json({ success: false, message: "Chapter ID is required." });
		}

		const chapter = await Chapter.findById(chapterId);
		if (!chapter) {
			return res
				.status(404)
				.json({ success: false, message: "Chapter not found." });
		}

		for (const levelId of chapter.levels) {
			const level = await Level.findById(levelId);
			if (!level) continue;

			const sections = await Section.find({ level: levelId });

			for (const section of sections) {
				for (const itemId of section.items) {
					const item = await Item.findById(itemId);
					if (item) {
						if (item.file) {
							const folderMap = {
								video: "videos",
								pdf: "pdfs",
								image: "images",
								audio: "audios",
							};

							const folder = folderMap[item.type];
							if (folder) {
								await deleteFile(item.file, folder);
							}
						}

						await item.deleteOne();
					}
				}

				await section.deleteOne();
			}

			await level.deleteOne();
		}

		await Diploma.updateMany(
			{ chapters: chapterId },
			{ $pull: { chapters: chapterId } }
		);

		await chapter.deleteOne();

		return res.status(200).json({
			success: true,
			message:
				"Chapter and all associated levels and items deleted successfully.",
		});
	} catch (error) {
		console.error("Error deleting chapter:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
};

exports.updateChapter = async (req, res, next) => {
	try {
		const { title } = req.body;
		const { chapterId } = req.params;

		if (!chapterId) {
			return res.status(400).json({
				success: false,
				message: "Chapter ID is required.",
			});
		}

		const chapter = await Chapter.findById(chapterId);
		if (!chapter) {
			return res.status(404).json({
				success: false,
				message: "Chapter not found.",
			});
		}

		if (title) chapter.title = title;

		await chapter.save();

		return res.status(200).json({
			status: "success",
			success: true,
			message: "Chapter updated successfully.",
		});
	} catch (error) {
		console.error("Error updating chapter:", error);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: error.message,
		});
	}
};

exports.updateLevel = async (req, res, next) => {
	try {
		const { title, order } = req.body;
		const { levelId } = req.params;

		if (!levelId) {
			return res.status(400).json({
				success: false,
				message: "Level ID is required.",
			});
		}

		const level = await Level.findById(levelId);
		if (!level) {
			return res.status(404).json({
				success: false,
				message: "Level not found.",
			});
		}

		if (title) level.title = title;
		if (order) level.order = order;

		await level.save();

		return res.status(200).json({
			status: "success",
			success: true,
			message: "Level updated successfully.",
		});
	} catch (error) {
		console.error("Error updating level:", error);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: error.message,
		});
	}
};

exports.updateLevelItem = async (req, res, next) => {
	try {
		const { title, type, fileBuffer, description, points } = req.body;
		const { itemId } = req.params;

		if (!itemId) {
			return res.status(400).json({
				success: false,
				message: "Item ID is required.",
			});
		}

		const item = await Item.findById(itemId);
		if (!item) {
			return res.status(404).json({
				success: false,
				message: "Item not found.",
			});
		}

		const folderMap = {
			video: "videos",
			audio: "audios",
			image: "images",
			pdf: "pdfs",
		};

		const saveAndDeleteMap = {
			video: saveAndDeleteVideo,
			audio: saveAndDeleteAudio,
			image: saveAndDeleteImage,
			pdf: saveAndDeletePdfFS,
		};

		if (fileBuffer && type) {
			const folder = folderMap[type];
			const saveAndDelete = saveAndDeleteMap[type];

			if (folder && saveAndDelete && fileBuffer !== "") {
				item.file = await saveAndDelete(item.file, fileBuffer, folder);
			}
		}
		if (title) item.title = title;
		if (type) item.type = type;
		if (description) item.description = description;
		if (points) item.points = points;

		await item.save();

		return res.status(200).json({
			status: "success",
			success: true,
			message: "Item updated successfully.",
		});
	} catch (error) {
		console.error("Error updating item:", error);
		return res.status(500).json({
			success: false,
			message: "Server error.",
			error: error.message,
		});
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

const fs = require("fs");
const path = require("path");

const Chapter = require("../models/ChapterModel");
const Diploma = require("../models/DiplomaModel");
const Student = require("../models/StudentModel");
const Level = require("../models/LevelModel");
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
	const { chapterId } = req.params;
	const { level, video, audio, image, pdf, text } = req.body;

	try {
		const newLevel = [];

		if (video.base64) {
			const uploadedVideo = await saveAndDeleteVideo(
				null,
				video.base64,
				"videos"
			);
			newLevel.push({
				type: "video",
				file: uploadedVideo,
				points: video.points,
			});
		}

		if (audio.base64) {
			const uploadedAudio = await saveAndDeleteAudio(
				null,
				audio.base64,
				"audios"
			);
			newLevel.push({
				type: "audio",
				file: uploadedAudio,
				points: audio.points,
			});
		}

		if (image.base64) {
			const uploadedImage = await saveAndDeleteImage(null, image.base64);
			newLevel.push({
				type: "image",
				file: uploadedImage,
				points: image.points,
			});
		}

		if (pdf.base64) {
			const uploadedPdf = await saveAndDeletePdfFS(null, pdf.base64, "pdfs");
			newLevel.push({
				type: "pdf",
				file: uploadedPdf,
				points: pdf.points,
			});
		}

		if (text.text) {
			newLevel.push({
				type: "text",
				file: text.text,
				points: text.points,
			});
		}

		const levelField = `level${level}`;
		const updatedChapter = await Chapter.findByIdAndUpdate(
			chapterId,
			{
				$push: { [levelField]: { $each: newLevel } },
			},
			{ new: true }
		);

		if (!updatedChapter) {
			return next(new ApiError("Chapter not found", 404));
		}

		return res.status(201).json({
			status: "success",
			result: updatedChapter,
			success: true,
			message: `Level ${level} created successfully`,
		});
	} catch (error) {
		return next(new ApiError(`Something went wrong: ${error.message}`, 500));
	}
};

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

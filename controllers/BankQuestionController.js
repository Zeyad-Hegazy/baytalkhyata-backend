const BankQuestion = require("../models/BankQuestionModel");
const Answer = require("../models/AnswerModel");
const Student = require("../models/StudentModel");

exports.createBankQuestion = async (req, res) => {
	try {
		const { question, answers, difficulty, points } = req.body;

		const createdAnswers = await Answer.insertMany(answers);
		const answerIds = createdAnswers.map((answer) => answer._id);

		const newQuestion = await BankQuestion.create({
			question,
			answers: answerIds,
			difficulty,
			points,
		});

		return res.status(201).json({
			status: "success",
			result: newQuestion,
			success: true,
			message: "new question created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getBankQuestions = async (req, res, next) => {
	try {
		const { difficulty } = req.query;

		const query = difficulty ? { difficulty } : {};

		const questions = await BankQuestion.find(query)
			.select("question answers points")
			.populate({
				path: "answers",
				select: "text",
			});

		res.status(200).json(questions);
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.submitBankQuestionAnswer = async (req, res) => {
	try {
		const studentId = req.user._id;
		const { questionId, answerId } = req.body;

		const question = await BankQuestion.findById(questionId).populate(
			"answers"
		);

		if (!question) {
			return res.status(404).json({ message: "Question not found" });
		}

		const selectedAnswer = question.answers.find((answer) =>
			answer._id.equals(answerId)
		);

		if (!selectedAnswer) {
			return res.status(404).json({ message: "Answer not found" });
		}

		const isCorrect = selectedAnswer.isCorrect;

		let updatedUser;

		if (isCorrect) {
			updatedUser = await Student.findByIdAndUpdate(
				studentId,
				{ $inc: { points: question.points } },
				{ new: true }
			);
		}

		res.status(200).json({
			isCorrect,
			message: isCorrect ? "Correct answer!" : "Incorrect answer.",
			updatedPoints: updatedUser ? updatedUser.points : undefined,
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

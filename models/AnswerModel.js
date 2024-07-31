const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
	{
		text: { type: String, required: true },
		isCorrect: { type: Boolean, required: true },
	},
	{ timestamps: true }
);

const Answer = mongoose.model("Answer", AnswerSchema);

module.exports = Answer;

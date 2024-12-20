const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		chapter: { type: mongoose.Schema.ObjectId, ref: "Chapter", default: null },
		section: { type: mongoose.Schema.ObjectId, ref: "Section", default: null },
		questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
		totalScore: { type: Number, default: 100 },
		passedScore: { type: Number },
	},
	{ timestamps: true }
);

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;

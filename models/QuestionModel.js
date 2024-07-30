const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
	text: { type: String, required: true },
	answers: [{ type: mongoose.Schema.ObjectId, ref: "Answer" }],
	score: { type: Number },
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;

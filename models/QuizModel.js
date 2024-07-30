const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
	title: { type: String, required: true },
	level: { type: mongoose.Schema.ObjectId, ref: "Level" },
	questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
	totalScore: { type: Number, default: 0 },
});

module.exports = mongoose.model("Quiz", QuizSchema);

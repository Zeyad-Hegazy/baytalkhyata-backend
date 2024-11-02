const mongoose = require("mongoose");

const BankQuestionSchema = mongoose.Schema({
	question: String,
	answers: [{ type: mongoose.Schema.ObjectId, ref: "Answer" }],
	difficulty: { type: String, enum: ["hard", "medium", "easy"] },
	points: Number,
});

const BankQuestion = mongoose.model("BankQuestion", BankQuestionSchema);

module.exports = BankQuestion;

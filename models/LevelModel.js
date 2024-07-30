const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
	title: { type: String, required: true },
	chapter: { type: mongoose.Schema.ObjectId, ref: "Chapter" },
	items: [{ type: mongoose.Schema.ObjectId, ref: "Item" }],
	isFinalQuiz: { type: Boolean, default: false },
	quiz: { type: mongoose.Schema.ObjectId, ref: "Quiz" },
});

const Level = mongoose.model("Level", LevelSchema);

module.exports = Level;

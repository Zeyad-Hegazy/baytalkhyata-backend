const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema({
	title: { type: String, required: true },
	diploma: { type: mongoose.Schema.ObjectId, ref: "Diploma" },
	levels: [{ type: mongoose.Schema.ObjectId, ref: "Level" }],
});

const Chapter = mongoose.model("Chapter", ChapterSchema);

module.exports = Chapter;

const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ["video", "pdf", "image", "text", "audio", "quiz"],
	},
	file: String,
	points: { type: Number, default: 0 },
});

const ChapterSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		diploma: { type: mongoose.Schema.ObjectId, ref: "Diploma" },
		levelOne: [levelSchema],
		levelTwo: [levelSchema],
		levelThree: [levelSchema],
		levelFour: [levelSchema],
		levelFive: [levelSchema],
	},
	{ timestamps: true }
);

const Chapter = mongoose.model("Chapter", ChapterSchema);

module.exports = Chapter;

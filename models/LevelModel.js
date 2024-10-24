const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		chapter: { type: mongoose.Schema.ObjectId, ref: "Chapter" },
		sections: [{ type: mongoose.Schema.ObjectId, ref: "Section", default: [] }],
		order: Number,
		finalQuiz: { type: mongoose.Schema.ObjectId, ref: "Quiz", default: null },
	},
	{ timestamps: true }
);

const Level = mongoose.model("Level", LevelSchema);

module.exports = Level;

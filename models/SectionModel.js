const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		level: { type: mongoose.Schema.ObjectId, ref: "Level" },
		items: [{ type: mongoose.Schema.ObjectId, ref: "Item", default: [] }],
		quizes: [{ type: mongoose.Schema.ObjectId, ref: "Quiz", default: [] }],
		order: Number,
	},
	{ timestamps: true }
);

const Section = mongoose.model("Section", SectionSchema);

module.exports = Section;

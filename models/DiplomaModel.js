const mongoose = require("mongoose");

const DiplomaSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	certificateTemplate: { type: String },
	chapters: [{ type: mongoose.Schema.ObjectId, ref: "Chapter" }],
	totalPoints: { type: Number, default: 0 },
	createdBy: { type: mongoose.Schema.ObjectId, ref: "Admin" },
});

const Diploma = mongoose.model("Diploma", DiplomaSchema);

module.exports = Diploma;

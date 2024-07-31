const mongoose = require("mongoose");

const DiplomaSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		price: Number,
		description: { type: String },
		totalHours: Number,
		certificateTemplate: { type: String },
		chapters: [{ type: mongoose.Schema.ObjectId, ref: "Chapter" }],
		totalPoints: { type: Number, default: 0 },
		createdBy: { type: mongoose.Schema.ObjectId, ref: "Admin" },
	},
	{ timestamps: true }
);

const Diploma = mongoose.model("Diploma", DiplomaSchema);

module.exports = Diploma;

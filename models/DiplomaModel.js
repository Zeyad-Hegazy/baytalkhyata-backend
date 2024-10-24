const mongoose = require("mongoose");

const DiplomaSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		price: Number,
		description: { type: String },
		totalHours: Number,
		certificateTemplate: { type: String },
		chapters: [{ type: mongoose.Schema.ObjectId, ref: "Chapter", default: [] }],
		// totalPoints: { type: Number, default: 0 },
		expiresIn: Date,
	},
	{ timestamps: true }
);

const Diploma = mongoose.model("Diploma", DiplomaSchema);

module.exports = Diploma;

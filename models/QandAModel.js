const mongoose = require("mongoose");

const FQASchema = new mongoose.Schema(
	{
		title: String,
		replayes: [{ type: mongoose.Schema.ObjectId, ref: "FQAReplay" }],
	},
	{ timestamps: true }
);

const FQA = mongoose.model("FQA", FQASchema);

module.exports = FQA;

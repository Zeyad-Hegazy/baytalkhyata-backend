const mongoose = require("mongoose");

const FQAReplaySchema = new mongoose.Schema(
	{
		title: String,
	},
	{ timestamps: true }
);

const FQAReplay = mongoose.model("FQAReplay", FQAReplaySchema);

module.exports = FQAReplay;

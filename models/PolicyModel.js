const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema(
	{
		title: String,
		content: String,
	},
	{ timestamps: true }
);

const Policy = mongoose.model("Policy", PolicySchema);

module.exports = Policy;

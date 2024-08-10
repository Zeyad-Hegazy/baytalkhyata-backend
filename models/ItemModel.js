const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ["video", "pdf", "image", "text", "audio", "quiz"],
		},
		content: {
			publicId: String,
			secureUrl: String,
		},
		size: String,
		points: { type: Number, default: 0 },
		level: { type: mongoose.Schema.ObjectId, ref: "Level" },
	},
	{ timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;

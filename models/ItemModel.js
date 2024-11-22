const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		order: Number,
		type: {
			type: String,
			required: true,
			enum: ["video", "pdf", "image", "text", "audio", "quiz"],
		},
		file: { type: String, default: null },
		size: String,
		points: { type: Number, default: 0 },
		section: { type: mongoose.Schema.ObjectId, ref: "Section", default: null },
		isUploaded: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;

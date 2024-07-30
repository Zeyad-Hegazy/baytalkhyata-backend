const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: ["video", "pdf", "image", "text", "audio", "quiz"],
	},
	content: { type: String, required: true },
	points: { type: Number, default: 0 },
	level: { type: mongoose.Schema.ObjectId, ref: "Level" },
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;

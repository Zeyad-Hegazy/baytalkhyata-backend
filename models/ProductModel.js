const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	coverImage: { type: String },
	points: { type: Number, required: true },
	createdBy: { type: mongoose.Schema.ObjectId, ref: "Admin" },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;

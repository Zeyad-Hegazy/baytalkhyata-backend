const mongoose = require("mongoose");

const CategoryItemSchema = new mongoose.Schema(
	{
		title: String,
		image: String,
		price: Number,
		category: {
			type: mongoose.Schema.ObjectId,
			ref: "Category",
		},
	},
	{ timestamps: true }
);

const CategorySchema = new mongoose.Schema(
	{
		title: String,
	},
	{ timestamps: true }
);

const CategoryItem = mongoose.model("CategoryItem", CategoryItemSchema);
const Category = mongoose.model("Category", CategorySchema);

module.exports = {
	CategoryItem,
	Category,
};

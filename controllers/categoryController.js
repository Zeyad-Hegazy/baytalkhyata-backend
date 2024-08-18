const { Category, CategoryItem } = require("../models/CategoryModel");
const ApiError = require("../util/ApiError");
const { saveAndDeleteImage, deleteImage } = require("../util/imageUtil");

exports.createCategory = async (req, res, next) => {
	const { title } = req.body;
	try {
		const newCategory = await Category.create({ title });

		return res.status(201).json({
			status: "success",
			result: {
				_id: newCategory._id,
				title: newCategory.title,
			},
			success: true,
			message: "new category created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find({}, "title");

		return res.status(200).json({
			status: "success",
			result: categories,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

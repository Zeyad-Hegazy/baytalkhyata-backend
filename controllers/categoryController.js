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

exports.createCategoryItem = async (req, res, next) => {
	const { title, image, price, category } = req.body;

	try {
		const savedImage = await saveAndDeleteImage(null, image);
		const newItem = await CategoryItem.create({
			title,
			image: savedImage,
			price,
			category,
		});

		return res.status(201).json({
			status: "success",
			result: {
				_id: newItem._id,
				title: newItem.title,
				image: `${res.locals.baseUrl}/uploads/images/${newItem.image}`,
				price: newItem.price,
			},
			success: true,
			message: "new category item created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getCategoryItems = async (req, res, next) => {
	const { categoryId } = req.params;
	try {
		const categoryItems = await CategoryItem.find({ category: categoryId });

		if (categoryItems.length === 0) {
			return res.status(200).json({
				status: "success",
				result: [],
				success: true,
				message: "No Category Items Availabile",
			});
		}

		const formattedItems = categoryItems.map((item) => ({
			_id: item._id,
			title: item.title,
			image: `${res.locals.baseUrl}/uploads/images/${item.image}`,
			price: item.price,
		}));

		return res.status(200).json({
			status: "success",
			result: formattedItems,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

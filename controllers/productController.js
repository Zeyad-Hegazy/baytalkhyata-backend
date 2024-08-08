const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const Student = require("../models/StudentModel");
const ApiError = require("../util/ApiError");
const { saveAndDeleteImage, deleteImage } = require("../util/imageUtil");

exports.createProduct = async (req, res, next) => {
	const { image } = req.body;

	try {
		const newImage = await saveAndDeleteImage(null, image);

		const newProduct = await Product.create({ ...req.body, image: newImage });

		return res.status(201).json({
			status: "success",
			result: {
				_id: newProduct._id,
				title: newProduct.title,
				points: newProduct.points,
				image: `${res.locals.baseUrl}/uploads/${newProduct.image}`,
			},
			success: true,
			message: "new product created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find({});

		if (products.length === 0) {
			return res.status(200).json({
				status: "success",
				result: [],
				success: true,
				message: "No Products Availabile",
			});
		}

		const formattedProducts = products.map((product) => ({
			_id: product._id,
			title: product.title,
			points: product.points,
			image: `${res.locals.baseUrl}/uploads/${product.image}`,
		}));

		return res.status(200).json({
			status: "success",
			result: formattedProducts,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getProduct = async (req, res, next) => {
	const { productId } = req.params;
	try {
		const product = await Product.findById(productId);

		if (!product) {
			return next(new ApiError("product not found", 404));
		}

		product.image = `${res.locals.baseUrl}/uploads/${product.image}`;

		return res.status(200).json({
			status: "success",
			result: product,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.updateProduct = async (req, res, next) => {
	const { productId } = req.params;
	const { title, image, points } = req.body;
	try {
		const product = await Product.findById(productId);

		if (!product) {
			return next(new ApiError("product not found", 404));
		}

		const updatedImage = await saveAndDeleteImage(product.image, image);

		product.title = title || product.title;
		product.points = points || product.points;
		product.image = updatedImage;

		await product.save();

		return res.status(200).json({
			status: "success",
			result: {
				_id: product._id,
				title: product.title,
				points: product.points,
				image: `${res.locals.baseUrl}/uploads/${product.image}`,
			},
			success: true,
			message: "product updated",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.deleteProduct = async (req, res, next) => {
	const { productId } = req.params;
	try {
		const product = await Product.findById(productId);

		if (!product) {
			return next(new ApiError("product not found", 404));
		}

		await deleteImage(product.image);

		await Product.findByIdAndDelete(productId);

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "product deleted",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.deleteMenyProducts = async (req, res, next) => {
	try {
		const { productIds } = req.body;

		if (!productIds || productIds.length === 0) {
			return res.status(400).json({
				status: "fail",
				message: "Product IDs array is required and must not be empty.",
			});
		}

		const productIdObjects = productIds.map(
			(productId) => new mongoose.Types.ObjectId(productId)
		);

		const products = await Product.find({ _id: { $in: productIdObjects } });

		if (!products || products.length === 0) {
			return res.status(404).json({
				status: "fail",
				message: "No products found for the given IDs.",
			});
		}

		const imageDeletionPromises = products.map((product) =>
			deleteImage(product.image)
		);
		await Promise.all(imageDeletionPromises);

		await Product.deleteMany({
			_id: { $in: productIdObjects },
		});

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "products deleted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.redeemProduct = async (req, res, next) => {
	const { productId } = req.params;

	try {
		const user = await Student.findById(req.user._id);
		if (!user) {
			return next(new ApiError("user not found", 404));
		}
		const product = await Product.findById(productId);
		if (!product) {
			return next(new ApiError("product not found", 404));
		}

		if (user.points < product.points) {
			return res.status(200).json({
				status: "fail",
				result: null,
				success: false,
				message: "you don't have enogh points",
			});
		}

		user.ownedProdcuts.push(product._id);
		user.points = user.points - product.points;
		await user.save();

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "product redeemed",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.giftProduct = async (req, res, next) => {
	const { productId } = req.params;
	const { userId } = req.body;

	try {
		const user = await Student.findById(userId);
		if (!user) {
			return next(new ApiError("user not found", 404));
		}
		const product = await Product.findById(productId);
		if (!product) {
			return next(new ApiError("product not found", 404));
		}

		user.ownedProdcuts.push(product._id);
		await user.save();

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "product gifted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

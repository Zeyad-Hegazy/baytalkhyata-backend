const Diploma = require("../models/DiplomaModel");
const ApiError = require("../util/ApiError");

exports.createDiploma = async (req, res, next) => {
	const { title, description, totalPoints, price, totalHours, expiresIn } =
		req.body;

	try {
		const newDiploma = await Diploma.create({
			title,
			description,
			totalPoints,
			price,
			totalHours,
			expiresIn,
		});

		return res.status(201).json({
			status: "success",
			result: {
				_id: newDiploma._id,
				title: newDiploma.title,
				description: newDiploma.description,
				totalHours: newDiploma.totalHours,
				price: newDiploma.price,
				totalPoints: newDiploma.totalPoints,
				chapters: newDiploma.chapters,
				expiresIn: newDiploma.expiresIn,
			},
			success: true,
			message: "new diploma created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getDiplomas = async (req, res, next) => {
	try {
		const diplomas = await Diploma.find({})
			.select(
				"title description totalHours chapters price totalPoints expiresIn"
			)
			.populate({ path: "chapters", select: "title" });

		// const diplomasWithChapterLength = diplomas.map((diploma) => ({
		// 	...diploma._doc,
		// 	chapters: diploma.chapters.length,
		// }));

		return res.status(200).json({
			status: "success",
			result: diplomas,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong : " + error, 500));
	}
};

exports.deleteDiploma = async (req, res, next) => {
	try {
		const { diplomaId } = req.params;

		await Diploma.findByIdAndDelete(diplomaId);

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "Diploma deleted successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.updateDiploma = async (req, res, next) => {
	const { diplomaId } = req.params;

	try {
		const updatedDiploma = await Diploma.findByIdAndUpdate(
			diplomaId,
			req.body,
			{
				new: true,
			}
		);

		return res.status(200).json({
			status: "success",
			result: {
				_id: updatedDiploma._id,
				title: updatedDiploma.title,
				description: updatedDiploma.description,
				totalHours: updatedDiploma.totalHours,
				price: updatedDiploma.price,
				totalPoints: updatedDiploma.totalPoints,
				chapters: updatedDiploma.chapters.length,
				expiresIn: updatedDiploma.expiresIn,
			},
			success: true,
			message: "diploma updated successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

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
				chapters: newDiploma.chapters.length,
				createdAt: newDiploma.createdAt,
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
		const diplomas = await Diploma.find({}).select(
			"title description totalHours chapters price totalPoints createdAt"
		);

		const diplomasWithChapterLength = diplomas.map((diploma) => ({
			...diploma._doc,
			chapters: diploma.chapters.length,
		}));

		return res.status(200).json({
			status: "success",
			result: diplomasWithChapterLength,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong : " + error, 500));
	}
};

const Diploma = require("../models/DiplomaModel");
const Student = require("../models/StudentModel");
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

// Studnet Mobile

const calculateCompletionPercentage = (chapters, completedLevels) => {
	const totalLevels = chapters.reduce((acc, chapter) => acc + 5, 0);

	const completedCount = completedLevels.reduce(
		(acc, completedChapter) => acc + completedChapter.levelIds.length,
		0
	);

	const completionPercentage = ((completedCount / totalLevels) * 100).toFixed(
		2
	);
	return completionPercentage;
};

const calculateChapterCompletionPercentage = (chapter, completedLevels) => {
	const totalLevels = 5;

	const completedChapter = completedLevels.find(
		(completed) => completed.chapterId.toString() === chapter._id.toString()
	);

	const completedCount = completedChapter
		? completedChapter.levelIds.length
		: 0;

	const completionPercentage = ((completedCount / totalLevels) * 100).toFixed(
		2
	);
	return completionPercentage;
};

exports.getStudentAllDiplomas = async (req, res, next) => {
	try {
		const diplomas = await Diploma.find({}).select(
			"title description totalHours price totalPoints expiresIn"
		);

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

exports.getStudentDiplomas = async (req, res, next) => {
	try {
		const studentId = req.user._id;

		const student = await Student.findById(studentId).populate({
			path: "enrolledDiplomas.diploma",
			model: "Diploma",
			select: "title description chapters",
			populate: {
				path: "chapters",
				model: "Chapter",
				select: "title levelOne levelTwo levelThree levelFour levelFive",
			},
		});

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const diplomasData = student.enrolledDiplomas.map((enrolled) => {
			const diploma = enrolled.diploma;
			const completedLevels = enrolled.completedLevels;

			const completionPercentage = calculateCompletionPercentage(
				diploma.chapters,
				completedLevels
			);

			return {
				_id: diploma._id,
				title: diploma.title,
				description: diploma.description,
				percentageCompleted: completionPercentage,
			};
		});

		return res.status(200).json({
			status: "success",
			result: diplomasData,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error.message, 500));
	}
};

exports.getBookMarkedDiplomas = async (req, res, next) => {
	try {
		const studentId = req.user._id;

		const student = await Student.findById(studentId).populate({
			path: "bookMarkedDiplomas",
			model: "Diploma",
			select: "title description totalHours price totalPoints expiresIn",
		});

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const diplomasData = student.bookMarkedDiplomas.map((bookMarkerDiploma) => {
			return {
				_id: bookMarkerDiploma._id,
				title: bookMarkerDiploma.title,
				description: bookMarkerDiploma.description,
				totalHours: bookMarkerDiploma.totalHours,
				price: bookMarkerDiploma.price,
				totalPoints: bookMarkerDiploma.totalPoints,
				expiresIn: bookMarkerDiploma.expiresIn,
			};
		});

		return res.status(200).json({
			status: "success",
			result: diplomasData,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error.message, 500));
	}
};

exports.toggleDiplomaBookmark = async (req, res, next) => {
	try {
		const studentId = req.user._id;
		const { diplomaId } = req.params;

		const student = await Student.findById(studentId);

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const isBookmarked = student.bookMarkedDiplomas.includes(diplomaId);

		if (isBookmarked) {
			student.bookMarkedDiplomas = student.bookMarkedDiplomas.filter(
				(id) => id.toString() !== diplomaId
			);
		} else {
			student.bookMarkedDiplomas.push(diplomaId);
		}

		await student.save();

		return res.status(200).json({
			status: "success",
			result: student.bookMarkedDiplomas,
			success: true,
			message: isBookmarked
				? "Diploma removed from bookmarks"
				: "Diploma added to bookmarks",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error.message, 500));
	}
};

exports.getDiplomaChapters = async (req, res, next) => {
	try {
		const studentId = req.user._id;
		const { diplomaId } = req.params;

		const student = await Student.findById(studentId).populate({
			path: "enrolledDiplomas.diploma",
			model: "Diploma",
			select: "title description totalPoints totalHours chapters",
			populate: {
				path: "chapters",
				model: "Chapter",
				select:
					"title description levelOne levelTwo levelThree levelFour levelFive",
			},
		});

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const enrolledDiploma = student.enrolledDiplomas.find(
			(enrolled) => enrolled.diploma._id.toString() === diplomaId
		);

		if (!enrolledDiploma) {
			return res
				.status(404)
				.json({ message: "Diploma not found for this student" });
		}

		const diploma = enrolledDiploma.diploma;
		const completedLevels = enrolledDiploma.completedLevels || [];

		const chaptersData = diploma.chapters.map((chapter) => {
			const completedChapterLevels = completedLevels.find(
				(completed) =>
					completed.chapterId &&
					completed.chapterId.toString() === chapter._id.toString()
			);

			const completedLevelIds = completedChapterLevels
				? completedChapterLevels.levelIds
				: [];

			const totalPoints = calculateTotalPointsForChapter(
				chapter,
				completedLevelIds
			);

			const percentageCompleted = calculateChapterCompletionPercentage(
				chapter,
				completedLevelIds,
				totalPoints
			);

			return {
				_id: chapter._id,
				title: chapter.title,
				description: chapter.description,
				percentageCompleted,
				totalPoints,
			};
		});

		const completionPercentage = calculateCompletionPercentage(
			diploma.chapters,
			completedLevels
		);

		return res.status(200).json({
			status: "success",
			data: {
				_id: diploma._id,
				title: diploma.title,
				percentageCompleted: completionPercentage,
				totalPoints: diploma.totalPoints,
				totalHours: diploma.totalHours,
				chapters: chaptersData,
			},
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error.message, 500));
	}
};

function calculateTotalPointsForChapter(chapter, completedLevelIds) {
	let totalPoints = 0;

	const levels = [
		...chapter.levelOne,
		...chapter.levelTwo,
		...chapter.levelThree,
		...chapter.levelFour,
	];

	levels.forEach((level) => {
		if (completedLevelIds.includes(level._id.toString())) {
			totalPoints += level.points;
		}
	});

	if (
		chapter.levelFive &&
		completedLevelIds.includes(chapter.levelFive.toString())
	) {
		// TODO fetch Quiz model to get it's score
	}

	return totalPoints;
}

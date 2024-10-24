const FQA = require("../models/QandAModel");
const FQAReplay = require("../models/QrReplayes");

exports.createFQA = async (req, res, next) => {
	try {
		const { title, replayes } = req.body;

		const createdReplayes = await Promise.all(
			replayes.map(async (replay) => {
				const newReplay = new FQAReplay({ title: replay });
				await newReplay.save();
				return newReplay._id;
			})
		);

		const newFQA = new FQA({
			title,
			replayes: createdReplayes,
		});

		await newFQA.save();

		res.status(201).json({
			success: true,
			message: "FQA created successfully",
			data: newFQA,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to create FQA",
			error: error.message,
		});
	}
};

exports.updateFQA = async (req, res) => {
	try {
		const { fqaId } = req.params;
		const { title, replayes } = req.body;

		const existingFQA = await FQA.findById(fqaId);
		if (!existingFQA) {
			return res.status(404).json({
				success: false,
				message: "FQA not found",
			});
		}

		if (title) {
			existingFQA.title = title;
		}

		if (replayes && Array.isArray(replayes)) {
			await Promise.all(
				replayes.map(async (replay) => {
					if (replay._id) {
						await FQAReplay.findByIdAndUpdate(
							replay._id,
							{ title: replay.title },
							{ new: true }
						);
					} else {
						const newReplay = new FQAReplay({ title: replay.title });
						await newReplay.save();
						existingFQA.replayes.push(newReplay._id);
					}
				})
			);
		}

		await existingFQA.save();

		res.status(200).json({
			success: true,
			message: "FQA updated successfully",
			data: existingFQA,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to update FQA",
			error: error.message,
		});
	}
};

exports.getQuestionAnswers = async (req, res, next) => {
	try {
		const { fqaId } = req.params;

		const fqa = await FQA.findById(fqaId)
			.select("replayes")
			.populate({ path: "replayes", select: "title" });

		if (!fqa) {
			return res.status(404).json({
				success: false,
				message: "FQA not found",
			});
		}

		return res.status(200).json({
			status: "success",
			result: fqa.replayes,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch FQA details",
			error: error.message,
		});
	}
};

// student mobile

exports.getQuestions = async (req, res, next) => {
	try {
		const questions = await FQA.find().select("title");

		if (!questions.length) {
			return res.status(404).json({
				success: false,
				message: "No questions found",
			});
		}

		res.status(200).json({
			status: "success",
			result: questions,
			success: true,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch questions",
			error: error.message,
		});
	}
};

const Chapter = require("../models/ChapterModel");
const Diploma = require("../models/DiplomaModel");
const ApiError = require("../util/ApiError");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

exports.createChapter = async (req, res, next) => {
	const { title, diploma } = req.body;

	try {
		const newChapter = await Chapter.create({ title, diploma });

		await Diploma.findByIdAndUpdate(
			diploma,
			{
				$push: { chapters: newChapter._id },
			},
			{ new: true }
		);
		return res.status(201).json({
			status: "success",
			result: {
				_id: newChapter._id,
				title: newChapter.title,
			},
			success: true,
			message: "new chapter created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.addLevelToChapter = async (req, res, next) => {
	const { chapterId } = req.params;
	const { level, video, audio, image, pdf, text, points = 0, size } = req.body;

	const uploadToCloudinary = (fileBuffer, folder) => {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder, resource_type: "auto" },
				(error, result) => {
					if (error) {
						return reject(error);
					}
					resolve(result);
				}
			);
			Readable.from(fileBuffer).pipe(uploadStream);
		});
	};

	try {
		const newLevel = [];

		if (video) {
			const uploadedVideo = await uploadToCloudinary(video, "video");
			newLevel.push({
				type: "video",
				content: {
					publicId: uploadedVideo.public_id,
					secureUrl: uploadedVideo.secure_url,
				},
				points,
			});
		}

		if (audio) {
			const uploadedAudio = await uploadToCloudinary(audio, "audio");
			newLevel.push({
				type: "audio",
				content: {
					publicId: uploadedAudio.public_id,
					secureUrl: uploadedAudio.secure_url,
				},
				points,
			});
		}

		if (image) {
			const uploadedImage = await uploadToCloudinary(image, "image");
			newLevel.push({
				type: "image",
				content: {
					publicId: uploadedImage.public_id,
					secureUrl: uploadedImage.secure_url,
				},
				points,
			});
		}

		if (pdf) {
			const uploadedPdf = await uploadToCloudinary(pdf, "pdf");
			newLevel.push({
				type: "pdf",
				content: {
					publicId: uploadedPdf.public_id,
					secureUrl: uploadedPdf.secure_url,
				},
				points,
			});
		}

		if (text) {
			newLevel.push({
				type: "text",
				content: {
					publicId: null, // No publicId for text
					secureUrl: text, // Store text as "secureUrl" here for simplicity
				},
				points,
			});
		}

		const levelField = `level${level}`;
		const updatedChapter = await Chapter.findByIdAndUpdate(
			chapterId,
			{
				$push: { [levelField]: { $each: newLevel } },
			},
			{ new: true }
		);

		if (!updatedChapter) {
			return next(new ApiError("Chapter not found", 404));
		}

		return res.status(201).json({
			status: "success",
			result: updatedChapter,
			success: true,
			message: "level " + level + " created successfully",
		});
	} catch (error) {
		return next(new ApiError(`Something went wrong: ${error.message}`, 500));
	}
};

const Chapter = require("../models/ChapterModel");
const Diploma = require("../models/DiplomaModel");
const ApiError = require("../util/ApiError");
const { saveAndDeleteVideo } = require("../util/videoUtility");
const { saveAndDeleteAudio } = require("../util/audioUtility");
const { saveAndDeleteImage } = require("../util/imageUtil");
const { saveAndDeletePdfFS } = require("../util/pdfUtility");

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
	const { level, video, audio, image, pdf, text } = req.body;

	try {
		const newLevel = [];

		if (video.base64) {
			const uploadedVideo = await saveAndDeleteVideo(
				null,
				video.base64,
				"videos"
			);
			newLevel.push({
				type: "video",
				file: uploadedVideo,
				points: video.points,
			});
		}

		if (audio.base64) {
			const uploadedAudio = await saveAndDeleteAudio(
				null,
				audio.base64,
				"audios"
			);
			newLevel.push({
				type: "audio",
				file: uploadedAudio,
				points: audio.points,
			});
		}

		if (image.base64) {
			const uploadedImage = await saveAndDeleteImage(null, image.base64);
			newLevel.push({
				type: "image",
				file: uploadedImage,
				points: image.points,
			});
		}

		if (pdf.base64) {
			const uploadedPdf = await saveAndDeletePdfFS(null, pdf.base64, "pdfs");
			newLevel.push({
				type: "pdf",
				file: uploadedPdf,
				points: pdf.points,
			});
		}

		if (text.text) {
			newLevel.push({
				type: "text",
				file: text.text,
				points: text.points,
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
			message: `Level ${level} created successfully`,
		});
	} catch (error) {
		return next(new ApiError(`Something went wrong: ${error.message}`, 500));
	}
};

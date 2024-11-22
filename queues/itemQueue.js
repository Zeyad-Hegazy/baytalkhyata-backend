const Queue = require("bull");
const Item = require("../models/ItemModel");
const Section = require("../models/SectionModel");

const { saveAndDeleteVideo } = require("../util/videoUtility");
const { saveAndDeleteAudio } = require("../util/audioUtility");
const { saveAndDeleteImage } = require("../util/imageUtil");
const { saveAndDeletePdfFS } = require("../util/pdfUtility");

const itemQueue = new Queue("item-processing", {
	redis: {
		host: "127.0.0.1",
		port: 6379,
	},
});

itemQueue.process(async (job) => {
	const { itemId, levelId, fileBuffer } = job.data;

	try {
		const item = await Item.findById(itemId);

		let fileUrl;
		switch (item.type) {
			case "video":
				fileUrl = await saveAndDeleteVideo(null, fileBuffer, "videos");
				break;
			case "audio":
				fileUrl = await saveAndDeleteAudio(null, fileBuffer, "audios");
				break;
			case "image":
				fileUrl = await saveAndDeleteImage(null, fileBuffer, "images");
				break;
			case "pdf":
				fileUrl = await saveAndDeletePdfFS(null, fileBuffer, "pdfs");
				break;
			case "text":
				fileUrl = item.fileContent;
				break;
			default:
				throw new Error("Unsupported item type");
		}

		const section = await Section.findOne({ level: levelId });
		if (!section) {
			return next(new ApiError("Section not found", 404));
		}

		item.file = fileUrl;
		item.isUploaded = true;
		item.section = section._id;
		await item.save();

		section.items.push(item._id);
		await section.save();

		console.log(`Item processed and added to level ${levelId}.`);
	} catch (error) {
		console.error("Error processing job:", error);
		throw error;
	}
});

itemQueue.on("completed", (job, result) => {
	console.log(`Job ${job.id} completed successfully.`);
});

itemQueue.on("failed", (job, err) => {
	console.error(`Job ${job.id} failed with error: ${err.message}`);
});

itemQueue.on("stalled", (job) => {
	console.warn(`Job ${job.id} has stalled.`);
});

module.exports = itemQueue;

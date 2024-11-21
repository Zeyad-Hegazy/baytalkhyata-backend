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
	const { levelId, sectionId, item } = job.data;

	try {
		let fileUrl;
		switch (item.type) {
			case "video":
				fileUrl = await saveAndDeleteVideo(null, item.fileBuffer, "videos");
				break;
			case "audio":
				fileUrl = await saveAndDeleteAudio(null, item.fileBuffer, "audios");
				break;
			case "image":
				fileUrl = await saveAndDeleteImage(null, item.fileBuffer, "images");
				break;
			case "pdf":
				fileUrl = await saveAndDeletePdfFS(null, item.fileBuffer, "pdfs");
				break;
			case "text":
				fileUrl = item.fileContent;
				break;
			default:
				throw new Error("Unsupported item type");
		}

		const newItem = await Item.create({
			...item,
			file: fileUrl,
			section: sectionId,
		});

		const section = await Section.findById(sectionId);
		section.items.push(newItem._id);
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

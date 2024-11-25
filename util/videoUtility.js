const fs = require("fs");
const path = require("path");

const deleteFile = async (videoPath) => {
	try {
		const filePath = path.join("uploads", "videos", videoPath);
		await fs.promises.unlink(filePath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};

const saveFile = async (fileBuffer, folder) => {
	try {
		const bufferObj = new Buffer(fileBuffer);
		const uniqueFilename = `video-${Date.now()}-video.mp4`;
		const filePath = path.join("uploads", folder, uniqueFilename);

		await fs.promises.writeFile(filePath, bufferObj);

		return uniqueFilename;
	} catch (error) {
		console.error("Error saving file:", error);
		throw new Error("File processing failed");
	}
};

exports.saveAndDeleteVideo = async (
	existingFilePath,
	newFileBuffer,
	folder
) => {
	if (newFileBuffer) {
		const newFile = await saveFile(newFileBuffer, folder);
		if (existingFilePath) {
			await deleteFile(existingFilePath);
		}
		return newFile;
	}
	return existingFilePath;
};

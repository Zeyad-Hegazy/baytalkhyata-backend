const fs = require("fs");
const path = require("path");

const deleteFile = async (filePath) => {
	try {
		await fs.promises.unlink(filePath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};

const saveFile = async (base64String, folder) => {
	try {
		const base64Prefix = "data:video/mp4;base64,";
		if (base64String.startsWith(base64Prefix)) {
			base64String = base64String.replace(base64Prefix, "");
		}

		const fileBuffer = Buffer.from(base64String, "base64");
		const uniqueFilename = `video-${Date.now()}-video.mp4`;
		const filePath = path.join("uploads", folder, uniqueFilename);

		const writeStream = fs.createWriteStream(filePath);

		writeStream.write(fileBuffer);

		writeStream.end();

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

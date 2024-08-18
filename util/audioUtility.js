const fs = require("fs");
const path = require("path");

const deleteFile = async (filePath) => {
	try {
		await fs.promises.unlink(filePath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};

const saveAudioFile = async (base64String, folder) => {
	try {
		// Define the base64 prefix for audio files (assuming mp3 format)
		const base64Prefix = "data:audio/mp3;base64,";
		if (base64String.startsWith(base64Prefix)) {
			base64String = base64String.replace(base64Prefix, "");
		}

		const fileBuffer = Buffer.from(base64String, "base64");
		const uniqueFilename = `audio-${Date.now()}.mp3`;
		const filePath = path.join("uploads", folder, uniqueFilename);

		const writeStream = fs.createWriteStream(filePath);
		writeStream.write(fileBuffer);
		writeStream.end();

		return uniqueFilename;
	} catch (error) {
		console.error("Error saving file:", error);
		throw new Error("Audio file processing failed");
	}
};

exports.saveAndDeleteAudio = async (
	existingFilePath,
	newFileBuffer,
	folder
) => {
	if (newFileBuffer) {
		const newFile = await saveAudioFile(newFileBuffer, folder);
		if (existingFilePath) {
			await deleteFile(existingFilePath);
		}
		return newFile;
	}
	return existingFilePath;
};

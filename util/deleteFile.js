const deleteFile = async (filePath, folder) => {
	try {
		const fullPath = path.join("uploads", folder, filePath);
		const fileExists = fs.existsSync(fullPath);
		if (fileExists) await fs.promises.unlink(fullPath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};

module.exports = deleteFile;

const fs = require("fs");
const path = require("path");

const deleteFile = async (filePath) => {
	try {
		await fs.promises.unlink(filePath);
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};

const deleteDocument = async (documentPath, folder) => {
	if (documentPath) {
		try {
			const filePath = path.join("uploads", folder, documentPath);
			await deleteFile(filePath);
		} catch (error) {
			console.error("Error deleting document:", error);
		}
	}
};

const saveBase64PDF = async (base64String, folder) => {
	try {
		const pdfBuffer = Buffer.from(base64String, "base64");
		const uniqueFilename = `document-${Date.now()}.pdf`;
		const filePath = path.join("uploads", folder, uniqueFilename);

		// Save PDF
		fs.writeFileSync(filePath, pdfBuffer);

		return uniqueFilename;
	} catch (error) {
		console.error("Error saving base64 PDF:", error);
		throw new Error("PDF processing failed");
	}
};

exports.saveAndDeletePdfFS = async (existingPdfPath, newBase64Pdf, folder) => {
	if (newBase64Pdf) {
		const newImage = await saveBase64PDF(newBase64Pdf, folder);
		if (existingPdfPath) {
			await deleteDocument(existingPdfPath, folder);
		}
		return newImage;
	}
	return existingPdfPath;
};

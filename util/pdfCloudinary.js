const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const formatBytes = (bytes) => {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) return "0 Byte";
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round((bytes / Math.pow(1024, i)) * 10) / 10 + " " + sizes[i];
};

exports.deletePdf = async (publicId) => {
	if (publicId) {
		try {
			await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
		} catch (error) {
			console.error("Error deleting PDF:", error);
		}
	}
};

const saveBase64Pdf = async (base64String) => {
	try {
		const pdfBuffer = Buffer.from(base64String, "base64");
		const uniqueFilename = `pdf-${Date.now()}.pdf`;
		const tempFilePath = path.join(__dirname, uniqueFilename);

		await fs.promises.writeFile(tempFilePath, pdfBuffer);

		const result = await cloudinary.uploader.upload(tempFilePath, {
			resource_type: "raw",
			folder: "pdfs",
		});

		await fs.promises.unlink(tempFilePath);

		const saveingResult = {
			resultPublicId: result.public_id,
			resultSecureUrl: result.secure_url,
			resultSize: formatBytes(result.bytes),
		};

		return saveingResult;
	} catch (error) {
		console.error("Error saving base64 PDF:", error);
		throw new Error("PDF processing failed");
	}
};

exports.saveAndDeletePdf = async (existingPdfPublicId, newBase64Pdf) => {
	if (newBase64Pdf) {
		const result = await saveBase64Pdf(newBase64Pdf);
		if (existingPdfPublicId) {
			await this.deletePdf(existingPdfPublicId);
		}
		return result;
	}
	return existingPdfPublicId;
};

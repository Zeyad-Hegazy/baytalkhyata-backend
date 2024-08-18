const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

exports.deleteImage = async (imagePath) => {
	if (imagePath) {
		try {
			const filePath = path.join("uploads", "images", imagePath);
			await fs.promises.unlink(filePath);
		} catch (error) {
			console.error("Error deleting image:", error);
		}
	}
};

const saveBase64Image = async (base64String, isImage) => {
	try {
		if (base64String.startsWith("data:image")) {
			base64String = base64String.split(",")[1];
		}
		const imageBuffer = Buffer.from(base64String, "base64");

		let fileExtension;
		let formatOptions = {};

		if (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
			fileExtension = "jpeg";
			formatOptions = { quality: 100 };
		} else if (
			imageBuffer[0] === 0x89 &&
			imageBuffer[1] === 0x50 &&
			imageBuffer[2] === 0x4e &&
			imageBuffer[3] === 0x47
		) {
			fileExtension = "png";
		} else {
			throw new Error("Unsupported image format");
		}

		const uniqueFilename = `image-${Date.now()}-cover.${fileExtension}`;

		const filePath = path.join("uploads", "images", uniqueFilename);

		if (isImage) {
			let image = sharp(imageBuffer);
			if (fileExtension === "jpeg") {
				image = image.jpeg(formatOptions);
			} else if (fileExtension === "png") {
				image = image.png();
			}
			await image.toFile(filePath);
		} else {
			await fs.writeFile(filePath, imageBuffer);
		}

		return uniqueFilename;
	} catch (error) {
		console.error("Error saving base64 image:", error);
		throw new Error("Image processing failed");
	}
};

exports.saveAndDeleteImage = async (
	existingImagePath,
	newBase64Image,
	isImage = true
) => {
	if (newBase64Image) {
		const newImage = await saveBase64Image(newBase64Image, isImage);
		if (existingImagePath) {
			await this.deleteImage(existingImagePath);
		}
		return newImage;
	}
	return existingImagePath;
};

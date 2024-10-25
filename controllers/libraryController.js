const path = require("path");
const axios = require("axios");
const Library = require("../models/LibraryModel");
const ApiError = require("../util/ApiError");
const cloudinary = require("../config/cloudinary");
const { saveAndDeletePdf, deletePdf } = require("../util/pdfCloudinary");

exports.createItem = async (req, res, next) => {
	const { title, pdf } = req.body;
	try {
		const resultPdf = await saveAndDeletePdf(null, pdf);

		const newItem = await Library.create({
			title,
			pdfFile: {
				publicId: resultPdf.resultPublicId,
				secureUrl: resultPdf.resultSecureUrl,
			},
			size: resultPdf.resultSize,
		});

		return res.status(201).json({
			status: "success",
			result: {
				_id: newItem._id,
				title: newItem.title,
				image: newItem.image,
				size: newItem.size,
				createdAt: newItem.createdAt,
			},
			success: true,
			message: "new library item created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getItems = async (req, res, next) => {
	try {
		const items = await Library.find({}).select("title image size createdAt");
		return res.status(200).json({
			status: "success",
			result: items,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getPdfFromCloudinary = async (req, res, next) => {
	const { itemId } = req.params;

	try {
		const item = await Library.findById(itemId);
		res.status(200).json({ pdfUrl: item.pdfFile.secureUrl });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.downloadPdfFromCloudinary = async (req, res, next) => {
	const { itemId } = req.params;

	try {
		const item = await Library.findById(itemId);
		if (!item || !item.pdfFile) {
			return res
				.status(404)
				.json({ error: "Library item not found or PDF not available" });
		}

		const result = await cloudinary.api.resource(item.pdfFile.publicId, {
			resource_type: "raw",
		});

		const pdfUrl = result.secure_url;
		if (!pdfUrl) {
			return res.status(404).json({ error: "PDF URL not found" });
		}

		const response = await axios({
			url: pdfUrl,
			method: "GET",
			responseType: "stream",
		});

		const filename = path.basename(pdfUrl);

		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.setHeader("Content-Type", "application/pdf");

		response.data.pipe(res);
	} catch (error) {
		console.error("Error downloading PDF:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.updateItem = async (req, res, next) => {
	const { itemId } = req.params;
	const { title, pdf } = req.body;

	try {
		const item = await Library.findById(itemId);

		item.title = title || item.title;
		if (pdf) {
			const updatedPdf = await saveAndDeletePdf(item.pdfFile.publicId, pdf);
			item.pdfFile.publicId =
				updatedPdf.resultPublicId || item.pdfFile.publicId;
			item.pdfFile.secureUrl =
				updatedPdf.resultSecureUrl || item.pdfFile.secureUrl;
		}
		await item.save();

		return res.status(200).json({
			status: "success",
			result: {
				_id: item._id,
				title: item.title,
				image: item.image,
				size: item.size,
				createdAt: item.createdAt,
			},
			success: true,
			message: "library item updated successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.deleteItem = async (req, res, next) => {
	const { itemId } = req.params;

	try {
		const item = await Library.findById(itemId);
		await deletePdf(item.pdfFile.publicId);
		await Library.findByIdAndDelete(itemId);

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "library item deleted successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

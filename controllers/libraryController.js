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
			result: newItem,
			success: true,
			message: "new library item created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getItems = async (req, res, next) => {
	try {
		const items = await Library.find({}).select("title image createdAt");
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
		const result = await cloudinary.api.resource(item.pdfFile.publicId, {
			resource_type: "raw",
		});

		res.redirect(result.secure_url);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}

	// try {
	// 	// Generate URL for the PDF
	// 	const item = await Library.findById(itemId);

	// 	const pdfUrl = cloudinary.url(item.pdfFile.publicId, {
	// 		resource_type: "raw",
	// 	});

	// 	// Fetch the PDF
	// 	const response = await fetch(pdfUrl);

	// 	if (!response.ok) {
	// 		throw new Error(`Error fetching PDF: ${response.statusText}`);
	// 	}

	// 	const pdfBlob = await response.blob();
	// 	console.log("PDF retrieved successfully:", pdfBlob);
	// } catch (error) {
	// 	console.error("Error retrieving PDF:", error.message);
	// }
};

exports.downloadPdfFromCloudinary = async (req, res, next) => {
	const { itemId } = req.params; // Assuming the Library item ID is passed as a URL parameter

	try {
		const item = await Library.findById(itemId);
		if (!item) {
			return res.status(404).json({ error: "Library item not found" });
		}

		// Fetch the PDF from Cloudinary
		const result = await cloudinary.api.resource(item.pdfFile.secureUrl, {
			resource_type: "raw",
		});

		// Download the PDF file
		const response = await axios({
			url: result.secure_url,
			method: "GET",
			responseType: "stream",
		});

		// Set the filename for the download
		const filename = path.basename(item.pdfFile);

		// Set headers for file download
		res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
		res.setHeader("Content-Type", "application/pdf");

		// Pipe the PDF data to the response
		response.data.pipe(res);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.updateItem = async (req, res, next) => {
	const { itemId } = req.params;
	const { title, pdf } = req.body;

	try {
		const item = await Library.findById(itemId);

		const updatedPdf = await saveAndDeletePdf(item.pdfFile.publicId, pdf);

		console.log(updatedPdf);
		item.title = title || item.title;
		item.pdfFile.publicId = updatedPdf.resultPublicId || item.pdfFile.publicId;
		item.pdfFile.secureUrl =
			updatedPdf.resultSecureUrl || item.pdfFile.secureUrl;
		await item.save();

		return res.status(200).json({
			status: "success",
			result: item,
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

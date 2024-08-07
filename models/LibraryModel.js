const mongoose = require("mongoose");

const imageLink =
	"https://img.freepik.com/premium-vector/modern-flat-design-pdf-file-icon-web_599062-7115.jpg?semt=ais_hybrid";

const LibrarySchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		image: { type: String, default: imageLink },
		pdfFile: {
			publicId: String,
			secureUrl: String,
		},
		size: String,
	},
	{ timestamps: true }
);

const Library = mongoose.model("Library", LibrarySchema);

module.exports = Library;

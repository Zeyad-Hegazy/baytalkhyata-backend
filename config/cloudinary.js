const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config({ path: "config.env" });

cloudinary.config({
	secure: true,
	cloud_name: process.env.CLOUDINARY_KEY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

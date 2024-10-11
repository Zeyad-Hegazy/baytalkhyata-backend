const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
	phone: {
		type: String,
		required: true,
	},
	code: {
		type: Number,
		required: true,
	},
	expiresAt: {
		type: Date,
		required: true,
		default: () => Date.now() + 5 * 60 * 1000, // OTP expires in 5 minutes
	},
	verified: {
		type: Boolean,
		required: true,
		default: false,
	},
});

// Index to automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	phone: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	points: { type: Number, default: 0 },
	enrolledDiplomas: [{ type: mongoose.Schema.ObjectId, ref: "Diploma" }],
	// completedItems: [{ type: mongoose.Schema.ObjectId, ref: "Item" }],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

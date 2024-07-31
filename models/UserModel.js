const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		userName: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		points: { type: Number, default: 0 },
		enrolledDiplomas: [
			{ type: mongoose.Schema.ObjectId, ref: "Diploma", default: [] },
		],
		ownedProdcuts: [
			{ type: mongoose.Schema.ObjectId, ref: "Product", default: [] },
		],
		role: { type: String, default: "user" },
		// completedItems: [{ type: mongoose.Schema.ObjectId, ref: "Item" }],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
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
		lastSeen: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;

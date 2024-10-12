const mongoose = require("mongoose");

const enrolledDiplomaSchema = new mongoose.Schema(
	{
		diploma: { type: mongoose.Schema.ObjectId, ref: "Diploma" },
		progress: { type: Number, default: 0 },
		completedLevels: [
			{
				chapterId: { type: mongoose.Schema.ObjectId, ref: "Chapter" },
				levelIds: [{ type: mongoose.Schema.ObjectId }],
			},
		],
	},
	{ _id: false }
);

const StudentSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		points: { type: Number, default: 0 },
		enrolledDiplomas: {
			type: [enrolledDiplomaSchema],
			default: [],
		},
		ownedProdcuts: [
			{ type: mongoose.Schema.ObjectId, ref: "Product", default: [] },
		],
		bookMarkedDiplomas: [{ type: mongoose.Schema.ObjectId, ref: "Diploma" }],
		role: { type: String, default: "user" },
		lastSeen: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;

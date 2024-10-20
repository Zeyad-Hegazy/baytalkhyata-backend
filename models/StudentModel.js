const mongoose = require("mongoose");

const enrolledDiplomaSchema = new mongoose.Schema(
	{
		diploma: { type: mongoose.Schema.ObjectId, ref: "Diploma", required: true },
		progress: { type: Number, default: 0 },
		completedLevels: [
			{
				chapterId: {
					type: mongoose.Schema.ObjectId,
					ref: "Chapter",
					required: true,
				},
				levelIds: {
					levelOne: { type: mongoose.Schema.ObjectId },
					levelTwo: { type: mongoose.Schema.ObjectId },
					levelThree: { type: mongoose.Schema.ObjectId },
					levelFour: { type: mongoose.Schema.ObjectId },
				},
			},
		],
		completedChapters: [{ type: mongoose.Schema.ObjectId, ref: "Chapter" }],
		totalPointsEarned: { type: Number, default: 0 },
	},
	{ _id: false }
);

const quizesTakenSchema = new mongoose.Schema(
	{
		quiz: { type: mongoose.Schema.ObjectId, ref: "Quiz", required: true },
		correctAnswers: { type: Number, default: 0 },
		submetedAnswers: [
			{ type: mongoose.Schema.ObjectId, ref: "Answer", required: true },
		],
		score: { type: Number, default: 0 },
		passed: { type: Boolean, default: false },
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
		quizesTaken: {
			type: [quizesTakenSchema],
			default: [],
		},
		role: { type: String, default: "user" },
		lastSeen: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

StudentSchema.methods.updateTotalPoints = async function () {
	let totalPoints = 0;
	for (const enrolled of this.enrolledDiplomas) {
		totalPoints += enrolled.totalPointsEarned;
	}
	this.points = totalPoints;
	await this.save();
};

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;

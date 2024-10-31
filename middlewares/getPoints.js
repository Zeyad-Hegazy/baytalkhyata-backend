const Student = require("../models/StudentModel");

module.exports = async (req, res, next) => {
	try {
		const { role, _id } = req.user;

		if (role === "user") {
			const points = await Student.findById(_id).select("points");
			req.studentPoints = points.points;
		}

		next();
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

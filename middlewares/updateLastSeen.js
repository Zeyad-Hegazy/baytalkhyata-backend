const Student = require("../models/StudentModel");

const updateLastSeen = async (req, res, next) => {
	const { _id, role } = req.user;

	if (role === "user") {
		await Student.findOneAndUpdate(
			{ _id },
			{ lastSeen: new Date() },
			{ upsert: true }
		);
	}
	next();
};

module.exports = updateLastSeen;

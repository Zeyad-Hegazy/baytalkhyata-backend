const mongoose = require("mongoose");
const Student = require("../models/StudentModel");
const Diploma = require("../models/DiplomaModel");
const ApiError = require("../util/ApiError");
const bcryptjs = require("bcryptjs");
const formatDate = require("../util/formatDate");

const { saveAndDeleteImage } = require("../util/imageUtil");

exports.createStudent = async (req, res, next) => {
	const { fullName, password, phone, email } = req.body;

	try {
		const existingEmail = await Student.findOne({ email });
		if (existingEmail) {
			return next(new ApiError("This email already used", 400));
		}

		const hashedPassword = await bcryptjs.hash(password, 12);

		const newUser = await Student.create({
			fullName,
			phone,
			email,
			password: hashedPassword,
		});

		return res.status(201).json({
			status: "success",
			result: {
				_id: newUser._id,
				fullName: newUser.fullName,
				phone: newUser.phone,
				email: newUser.email,
				points: newUser.points,
				lastSeen: newUser.lastSeen,
			},
			success: true,
			message: "new student created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getStudents = async (req, res, next) => {
	try {
		const { limit, skip } = req.pagination;

		const students = await Student.find({})
			.limit(limit)
			.skip(skip)
			.select("fullName email phone points lastSeen");

		const formattedStudents = students.map((student) => {
			return {
				...student.toObject(),
				lastSeen: formatDate(student.lastSeen),
			};
		});

		return res.status(200).json({
			status: "success",
			result: formattedStudents,
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.getStudent = async (req, res, next) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return next(new ApiError("student not found by this id " + userId, 404));
		}

		const student = await Student.findById(userId).select("-password");

		return res.status(200).json({
			status: "success",
			result: student,
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.getAuthenticatedUser = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const user = await Student.findById(userId).select(
			"fullName phone email image points"
		);

		if (!userId) {
			return next(new ApiError("student not found by this id " + userId, 404));
		}

		return res.status(200).json({
			status: "success",
			result: {
				_id: user._id,
				fullName: user.fullName,
				phone: user.phone,
				email: user.email,
				image: `${res.locals.baseUrl}/uploads/images/${user.image}`,
				points: user.points,
			},
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

// exports.updateUser = async (req, res, next) => {
// 	try {
// 		const { userId } = req.params;

// 		if (!userId) {
// 			return next(new ApiError("User ID not provided", 404));
// 		}

// 		const updatedUser = await User.findByIdAndUpdate(
// 			userId,
// 			{ ...req.body },
// 			{ new: true }
// 		).select("-password");

// 		return res.status(200).json({
// 			status: "success",
// 			result: updatedUser,
// 			success: true,
// 			message: "User updated successfully",
// 		});
// 	} catch (error) {
// 		next(new ApiError("Something went wrong: " + error.message, 500));
// 	}
// };

// exports.updateUserProfile = async (req, res, next) => {
// 	try {
// 		const userId = req.user._id;

// 		let user = await User.findById(userId).select("-password -role");

// 		if (!user) {
// 			return next(new ApiError("User not found", 404));
// 		}

// 		if (req.body.image) {
// 			const newImage = await saveAndDeleteImage(
// 				user.image,
// 				req.body.image,
// 				"user"
// 			);
// 			req.body.image = newImage;
// 		} else {
// 			req.body.image = user.image;
// 		}

// 		const updatedUser = await User.findByIdAndUpdate(
// 			userId,
// 			{ ...req.body, password: user.password },
// 			{ new: true }
// 		).select("-password");

// 		return res.status(200).json({
// 			status: "success",
// 			result: updatedUser,
// 			success: true,
// 			message: "User updated",
// 		});
// 	} catch (error) {
// 		next(new ApiError("Something went wrong: " + error.message, 500));
// 	}
// };

exports.deleteStudent = async (req, res, next) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return next(new ApiError("student not found by this id " + userId, 404));
		}

		await Student.findByIdAndDelete(userId);

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "student deleted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.deleteMenyStudents = async (req, res, next) => {
	try {
		const { studentIds } = req.body;

		if (!studentIds || studentIds.length === 0) {
			return res.status(400).json({
				status: "fail",
				message: "Student IDs array is required and must not be empty.",
			});
		}

		const userIdObjects = studentIds.map(
			(userId) => new mongoose.Types.ObjectId(userId)
		);

		await Student.deleteMany({
			_id: { $in: userIdObjects },
		});

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "students deleted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.updateStudent = async (req, res, next) => {
	const { userId } = req.params;
	const { fullName, phone, email } = req.body;
	try {
		const student = await Student.findById(userId).select(
			"fullName email phone points crearedAt"
		);

		if (!student) {
			return next(new ApiError("student not found", 404));
		}

		// if (email) {
		// 	const existingEmail = await Student.findOne({ email });
		// 	if (existingEmail) {
		// 		return res.status(200).json({
		// 			status: "fail",
		// 			result: student,
		// 			success: false,
		// 			message: "this email already used",
		// 		});
		// 	} else {
		// 		student.email = email || student.email;
		// 	}
		// }

		// if (phone) {
		// 	const existingPhone = await Student.findOne({ phone });
		// 	if (existingPhone) {
		// 		return res.status(200).json({
		// 			status: "fail",
		// 			result: student,
		// 			success: false,
		// 			message: "this phone already used",
		// 		});
		// 	} else {
		// 		student.phone = phone || student.phone;
		// 	}
		// }

		student.fullName = fullName || student.fullName;
		student.email = email || student.email;
		student.phone = phone || student.phone;

		await student.save();

		return res.status(200).json({
			status: "success",
			result: {
				_id: student._id,
				fullName: student.fullName,
				phone: student.phone,
				email: student.email,
				points: student.points,
				lastSeen: student.lastSeen,
			},
			success: true,
			message: "student updated",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.changePassword = async (req, res, next) => {
	try {
		const { oldPassword, newPassword, confirmPassword } = req.body;
		const userId = req.user._id;

		const user = await Student.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "Student not found" });
		}

		const isMatch = await bcryptjs.compare(oldPassword, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: "Wrong old password" });
		}

		const isNewEqualOld = await bcryptjs.compare(newPassword, user.password);

		if (isNewEqualOld) {
			return res
				.status(400)
				.json({ message: "You can't write same old password" });
		}

		if (newPassword !== confirmPassword) {
			return res.status(400).json({
				message: "New password and confirmation password do not match",
			});
		}

		const hashedPassword = await bcryptjs.hash(newPassword, 12);

		user.password = hashedPassword;
		await user.save();

		return res.status(200).json({
			status: "success",
			result: {
				fullName: user.fullName,
				phone: user.phone,
			},
			success: true,
			message: "password changed successfully",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.assignDiploma = async (req, res, next) => {
	const { userId } = req.params;
	const { diplomaId } = req.body;

	try {
		const userFound = await Student.findById(userId).select("-password -role");
		if (!userFound) {
			return next(new ApiError("User not found", 404));
		}

		const diplomaFound = await Diploma.findById(diplomaId);
		if (!diplomaFound) {
			return next(new ApiError("Diploma not found", 404));
		}

		const alreadyEnrolled = userFound.enrolledDiplomas.some(
			(enrolled) => enrolled.diploma.toString() === diplomaId
		);

		if (alreadyEnrolled) {
			return next(
				new ApiError("Student is already enrolled in this diploma", 400)
			);
		}

		userFound.enrolledDiplomas.push({
			diploma: diplomaId,
			progress: 0,
			completedLevels: [],
		});

		await userFound.save();

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "Diploma successfully assigned",
		});
	} catch (error) {
		next(new ApiError("Something went wrong: " + error.message, 500));
	}
};

exports.updateProfile = async (req, res, next) => {
	try {
		const studentId = req.user._id;
		const { fullName, phone, email, image, password } = req.body;

		const student = await Student.findById(studentId).select(
			"fullName phone email password image"
		);

		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		if (password) {
			const isTheSamePassword = await bcryptjs.compare(
				password,
				student.password
			);

			if (isTheSamePassword) {
				return res
					.status(400)
					.json({ message: "Cannot update to the same password" });
			}

			const newPassword = await bcryptjs.hash(password, 12);
			student.password = newPassword || student.password;
		}

		if (image) {
			if (student.image === "user-profile.png") {
				const newImage = await saveAndDeleteImage(null, image, true);
				student.image = newImage;
			} else {
				const newImage = await saveAndDeleteImage(student.image, image, true);
				student.image = newImage;
			}
		}

		student.fullName = fullName || student.fullName;
		student.email = email || student.email;
		student.phone = phone || student.phone;

		await student.save();

		res.status(200).json({
			status: "success",
			result: {
				_id: student._id,
				fullName: student.fullName,
				email: student.email,
				phone: student.phone,
				image: `${res.locals.baseUrl}/uploads/images/${student.image}`,
			},
			success: true,
			message: "Profile updated successfully",
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		res
			.status(500)
			.json({ message: "An error occurred while updating the profile" });
		next(error);
	}
};

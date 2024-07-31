const User = require("../models/UserModel");
const Diploma = require("../models/DiplomaModel");
const ApiError = require("../util/ApiError");
const bcryptjs = require("bcryptjs");

exports.createUser = async (req, res, next) => {
	const { userName, password, phone } = req.body;

	try {
		const existingUserName = await User.find({ userName });
		if (existingUserName) {
			return next(new ApiError("This user name already used", 400));
		}

		const hashedPassword = await bcryptjs.hash(password, 12);

		const newUser = await User.create({
			userName,
			phone,
			password: hashedPassword,
		});

		return res.status(201).json({
			status: "success",
			result: {
				userName: newUser.userName,
				phone: newUser.phone,
			},
			success: true,
			message: "new user created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getUsers = async (req, res, next) => {
	try {
		const { limit, skip } = req.pagination;

		const users = await User.find({}).limit(limit).skip(skip);

		return res.status(200).json({
			status: "success",
			result: users,
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.getUser = async (req, res, next) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return next(new ApiError("user not found by this id " + userId, 404));
		}

		const user = await User.findById(userId).select("-password");

		user.image = processImage(res, user, "user");

		return res.status(200).json({
			status: "success",
			result: user,
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.getUser = async (req, res, next) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return next(new ApiError("user not found by this id " + userId, 404));
		}

		const user = await User.findById(userId).select("-password");

		return res.status(200).json({
			status: "success",
			result: user,
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

		const user = await User.findById(userId).select("-password -role");

		if (!userId) {
			return next(new ApiError("user not found by this id " + userId, 404));
		}

		return res.status(200).json({
			status: "success",
			result: user,
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

exports.deleteUser = async (req, res, next) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return next(new ApiError("user not found by this id " + userId, 404));
		}

		await User.findByIdAndDelete(userId);

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "user deleted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.deleteMenyUsers = async (req, res, next) => {
	try {
		const { userIds } = req.body;

		if (!userIds || userIds.length === 0) {
			return res.status(400).json({
				status: "fail",
				message: "User IDs array is required and must not be empty.",
			});
		}

		const userIdObjects = userIds.map(
			(userId) => new mongoose.Types.ObjectId(userId)
		);

		await User.deleteMany({
			_id: { $in: userIdObjects },
		});

		return res.status(200).json({
			status: "success",
			result: null,
			success: true,
			message: "users deleted",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

exports.changePassword = async (req, res, next) => {
	try {
		const { oldPassword, newPassword, confirmPassword } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
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
				userName: user.userName,
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
		const userFound = await User.findById(userId).select("-password -role");
		if (!userFound) {
			return next(new ApiError("user not found", 404));
		}

		const diplomaFound = await Diploma.findById(diplomaId);
		if (!diplomaFound) {
			return next(new ApiError("diploma not found", 404));
		}

		userFound.enrolledDiplomas.push(diplomaId);
		await userFound.save();

		return res.status(200).json({
			status: "success",
			result: userFound,
			success: true,
			message: "success",
		});
	} catch (error) {
		next(new ApiError("somthing went wrong " + error, 500));
	}
};

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");
const ApiError = require("../util/ApiError");
const Student = require("../models/StudentModel");

const buildToken = (user) => {
	const expiresIn = 86400;
	const expirationDate = Math.floor(Date.now() / 1000) + expiresIn;

	const token = jwt.sign(
		{
			user: {
				_id: user._id,
				role: user.role,
			},
		},
		process.env.JWT_SECRET_KEY,
		{ expiresIn }
	);
	return { token, expiresIn, expirationDate };
};

const loginUser = async (model, email, password) => {
	const user = await model.findOne({ email });
	if (user) {
		const isPasswordCorrect = await bcryptjs.compare(password, user.password);
		if (isPasswordCorrect) {
			return user;
		}
	}
	return null;
};

const extractUserInfo = (res, user) => {
	return {
		_id: user?._id,
		email: user?.email,
		role: user?.role,
		createdAt: user?.createdAt,
	};
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const admin = await loginUser(Admin, email, password);
		if (admin) {
			const token = buildToken(admin).token;
			return res.status(200).json({
				status: "success",
				result: {
					user: extractUserInfo(res, admin),
					token,
				},
				message: "Logged in successfully",
			});
		}

		const user = await loginUser(Student, email, password);
		if (user) {
			const token = buildToken(user).token;
			return res.status(200).json({
				status: "success",
				result: {
					user: extractUserInfo(res, user),
					token,
				},
				message: "Logged in successfully",
			});
		}
		return next(new ApiError("User Not Found or password is incorrect", 404));
	} catch (error) {
		next(new ApiError("Something went wrong " + error, 500));
	}
};

exports.signiupAdmin = async (req, res, next) => {
	try {
		const { email, password, role } = req.body;

		const hashedPassword = await bcryptjs.hash(password, 12);

		const newAdmin = await Admin.create({
			email,
			password: hashedPassword,
			role,
		});

		res.status(201).json({
			status: "success",
			result: newAdmin,
			message: "admin created successfully",
		});
	} catch (error) {
		next(error);
	}
};

exports.tokenBlackList = new Set();

// @desc logout from BaytAlkyata
// @route POST /api/v1/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];
	this.tokenBlackList.add(token);
	res.status(200).json({ status: "success", message: "success" });
};

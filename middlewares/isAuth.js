const jwt = require("jsonwebtoken");
const ApiError = require("../util/ApiError");
const { tokenBlackList } = require("../controllers/authController");

module.exports = (req, res, next) => {
	try {
		const token =
			req.headers?.authorization && req.headers?.authorization.split(" ")[1];

		if (!token) {
			return next(new ApiError("Unauthorized", 401));
		}

		if (tokenBlackList.has(token)) {
			return next(new ApiError("Token is blacklisted", 401));
		}

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
		req.user = decodedToken.user;

		next();
	} catch (error) {
		next(new ApiError("cant get the bearer token " + error, 401));
	}
};

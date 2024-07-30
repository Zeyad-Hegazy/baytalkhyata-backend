const ApiError = require("../util/ApiError");

module.exports = (roles) => {
	return (req, res, next) => {
		try {
			let rolesArray = roles.map((el) => el.value);
			if (rolesArray.includes(req.user.role)) {
				next();
			} else {
				throw new ApiError("Insufficient permissions.", 422);
			}
		} catch (error) {
			throw new ApiError("Insufficient permissions. " + error, 422);
		}
	};
};

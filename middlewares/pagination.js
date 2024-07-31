exports.pagination = (req, res, next) => {
	let page = +req.query.page;
	let limit = +req.query.limit;

	if (!limit || limit <= 0) {
		limit = Number.MAX_SAFE_INTEGER;
	}

	if (!page || page < 1) {
		page = 1;
	}

	const skip = (page - 1) * limit;

	req.pagination = { limit, skip };

	next();
};

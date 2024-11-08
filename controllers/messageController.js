const Message = require("../models/MessageModel");
const ApiError = require("../util/ApiError");

exports.createMessage = async (req, res, next) => {
	try {
		const savedMessage = await Message.create(req.body);

		return res.status(201).json({
			status: "success",
			result: savedMessage,
			success: true,
			message: "new message created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getMessages = async (req, res, next) => {
	const { userId } = req.params;

	try {
		const messages = await Message.find({
			$or: [{ reciver: userId }, { sender: userId }],
		})
			.select("sender reciver text createdAt")
			.sort({ createdAt: 1 });

		return res.status(200).json({
			status: "success",
			result: messages,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error, 500));
	}
};

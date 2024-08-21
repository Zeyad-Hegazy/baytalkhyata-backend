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
	const { conversationId } = req.params;
	try {
		const messages = await Message.find({
			conversation: conversationId,
		});

		return res.status(200).json({
			status: "success",
			result: messages,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

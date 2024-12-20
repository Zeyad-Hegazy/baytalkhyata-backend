const Conversation = require("../models/ConversationModel");
const ApiError = require("../util/ApiError");

exports.createConversation = async (req, res, next) => {
	const { admin, student } = req.body;
	try {
		const exisitingConversation = await Conversation.findOne({
			memberIds: { $all: [admin, student] },
		});

		if (exisitingConversation) {
			return res.status(200).json({
				status: "success",
				result: exisitingConversation,
				success: true,
				message: "success",
			});
		}

		const newConversation = await Conversation.create({
			members: { admin, student },
			memberIds: [admin, student],
		});

		return res.status(201).json({
			status: "success",
			result: newConversation,
			success: true,
			message: "new conversation created successfully",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getConversations = async (req, res, next) => {
	const { userId } = req.params;
	try {
		const conversation = await Conversation.find({
			memberIds: { $in: [userId] },
		});

		return res.status(200).json({
			status: "success",
			result: conversation,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

exports.getConversation = async (req, res) => {
	const { firstUserId, secondUserId } = req.params;
	try {
		const conversation = await Conversation.findOne({
			memberIds: { $all: [firstUserId, secondUserId] },
		});
		if (!conversation) {
			return res.status(404).json({
				status: "success",
				result: null,
				success: true,
				message: "Conversation not found",
			});
		}

		return res.status(200).json({
			status: "success",
			result: conversation,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Somthing went wrong : " + error, 500));
	}
};

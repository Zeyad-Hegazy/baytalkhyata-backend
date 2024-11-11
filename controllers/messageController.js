const Message = require("../models/MessageModel");
const Student = require("../models/StudentModel");
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

exports.getMessagesList = async (req, res, next) => {
	const userId = req.user._id;

	try {
		const messages = await Message.find({ reciver: userId })
			.select("sender reciver text createdAt")
			.sort({ createdAt: 1 });

		const formattedList = await Promise.all(
			messages.map(async (message) => {
				const student = await Student.findById(message.sender).select(
					"fullName image"
				);
				const truncatedText =
					message.text.length > 50
						? message.text.slice(0, 47) + "..."
						: message.text;
				return {
					_id: message._id,
					sender: student ? student.fullName : "Unknown",
					senderImage: `${res.locals.baseUrl}/uploads/images/${student.image}`,
					text: truncatedText,
					createdAt: message.createdAt,
				};
			})
		);

		return res.status(200).json({
			status: "success",
			result: formattedList,
			success: true,
			message: "success",
		});
	} catch (error) {
		return next(new ApiError("Something went wrong: " + error, 500));
	}
};

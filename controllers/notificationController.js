const Notification = require("../models/NotificationModel.js");

exports.sendNotification = (io) => async (req, res) => {
	const { userId, title, content } = req.body;

	if (!userId || !content) {
		return res.status(400).json({ error: "User ID and content are required" });
	}

	try {
		const newNotification = await Notification.create({
			userId,
			title,
			content,
		});

		io.to(userId).emit("notification", {
			title,
			content,
			createdAt: newNotification.createdAt,
		});

		return res.status(200).json({
			status: "success",
			result: newNotification,
			success: true,
			message: "Notification sent",
		});
	} catch (error) {
		return res.status(500).json({ error: "Failed to send notification" });
	}
};

exports.getNotifications = async (req, res) => {
	const userId = req.user._id;

	try {
		const notifications = await Notification.find({ userId })
			.select("title content")
			.sort({
				createdAt: -1,
			});
		return res.status(200).json({
			status: "success",
			result: notifications,
			success: true,
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({ error: "Failed to retrieve notifications" });
	}
};

exports.sendNotification = (io) => (req, res) => {
	const { userId, title, message } = req.body;

	if (!userId || !message) {
		return res.status(400).json({ error: "User ID and message are required" });
	}

	io.to(userId).emit("notification", {
		title,
		message,
		timestamp: new Date(),
	});

	return res.status(200).json({ success: true, message: "Notification sent" });
};

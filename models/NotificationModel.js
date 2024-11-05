const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
	{
		title: String,
		content: String,
		userId: { type: mongoose.Schema.ObjectId, ref: "Student" },
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;

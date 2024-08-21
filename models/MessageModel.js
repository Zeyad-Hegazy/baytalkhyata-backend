const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
	{
		conversation: { type: mongoose.Schema.ObjectId, ref: "Conversation" },
		sender: String,
		text: String,
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;

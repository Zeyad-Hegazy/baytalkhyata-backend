const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
	{
		members: {
			admin: {
				type: mongoose.Schema.ObjectId,
				ref: "Admin",
				required: true,
			},
			student: {
				type: mongoose.Schema.ObjectId,
				ref: "Student",
				required: true,
			},
		},
		memberIds: [String],
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;

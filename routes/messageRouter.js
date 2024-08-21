const express = require("express");

const router = express.Router();

const {
	createMessage,
	getMessages,
} = require("../controllers/messageController");

router.post("/", createMessage);
router.get("/:conversationId", getMessages);

module.exports = router;

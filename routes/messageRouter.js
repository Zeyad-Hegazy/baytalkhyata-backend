const express = require("express");

const router = express.Router();

const {
	createMessage,
	getMessages,
	getMessagesList,
} = require("../controllers/messageController");

router.post("/", createMessage);
router.get("/list", getMessagesList);
router.get("/:userId", getMessages);

module.exports = router;

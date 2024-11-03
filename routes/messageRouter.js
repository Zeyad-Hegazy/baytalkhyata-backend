const express = require("express");

const router = express.Router();

const {
	createMessage,
	getMessages,
} = require("../controllers/messageController");

router.route("/").get(getMessages).post(createMessage);

module.exports = router;

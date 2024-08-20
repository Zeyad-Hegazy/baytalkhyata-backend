const express = require("express");

const router = express.Router();

const {
	createConversation,
	getConversations,
	getConversation,
} = require("../controllers/conversationController");

router.route("/").post(createConversation).get(getConversations);
router.get("/:firstUserId/:secondUserId", getConversation);

module.exports = router;

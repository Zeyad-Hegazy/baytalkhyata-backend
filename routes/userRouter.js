const express = require("express");

const router = express.Router();

const { getAuthenticatedUser } = require("../controllers/userController");

router.get("/profile", getAuthenticatedUser);

module.exports = router;

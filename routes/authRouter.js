const express = require("express");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

const {
	login,
	logout,
	signiupAdmin,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", isAuth, logout);
router.post("/signup/admin", signiupAdmin);

module.exports = router;

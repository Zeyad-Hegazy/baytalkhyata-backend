const express = require("express");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const isRole = require("../middlewares/isRole");
const { ADMIN } = require("../constants/userRoles");

const {
	login,
	logout,
	signiupAdmin,
	requestOTP,
	verifyOTP,
	changePassword,
} = require("../controllers/authController");

const { createStudent } = require("../controllers/studentController");

router.post("/login", login);
router.post("/logout", isAuth, logout);
router.post("/signup", createStudent);
router.post("/signup/admin", isAuth, isRole([{ value: ADMIN }]), signiupAdmin);

router.post("/forgot", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/change-password", changePassword);

module.exports = router;

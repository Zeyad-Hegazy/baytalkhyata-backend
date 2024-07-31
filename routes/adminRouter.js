const express = require("express");

const router = express.Router();

const {
	createUser,
	getUsers,
	getUser,
	deleteUser,
	deleteMenyUsers,
	assignDiploma,
} = require("../controllers/userController");

router.delete("/user/meny", deleteMenyUsers);
router.patch("/user/assign/:userId", assignDiploma);
router.route("/user").post(createUser).get(getUsers);
router.route("/user/:userId").get(getUser).delete(deleteUser);

module.exports = router;

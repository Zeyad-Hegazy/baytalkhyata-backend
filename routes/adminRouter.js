const express = require("express");

const router = express.Router();

const {
	createStudent,
	getStudents,
	getStudent,
	deleteStudent,
	deleteMenyStudents,
	assignDiploma,
} = require("../controllers/studentController");

const {
	createProduct,
	getProduct,
	updateProduct,
	deleteProduct,
	deleteMenyProducts,
	giftProduct,
	getProducts,
} = require("../controllers/productController");

const { pagination } = require("../middlewares/pagination");

router.delete("/student/meny", deleteMenyStudents);
router.patch("/student/assign/:userId", assignDiploma);
router.route("/student").post(createStudent).get(pagination, getStudents);
router.route("/student/:userId").get(getStudent).delete(deleteStudent);

router.patch("/product/gift/:productId", giftProduct);
router.delete("/product/meny", deleteMenyProducts);
router.route("/product").post(createProduct).get(pagination, getProducts);
router
	.route("/product/:productId")
	.get(getProduct)
	.patch(updateProduct)
	.delete(deleteProduct);

module.exports = router;

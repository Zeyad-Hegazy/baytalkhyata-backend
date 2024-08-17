const express = require("express");

const router = express.Router();

const {
	createStudent,
	getStudents,
	getStudent,
	deleteStudent,
	deleteMenyStudents,
	assignDiploma,
	updateStudent,
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

const {
	createItem,
	getItems,
	getPdfFromCloudinary,
	downloadPdfFromCloudinary,
	updateItem,
	deleteItem,
} = require("../controllers/libraryController");

const {
	createDiploma,
	getDiplomas,
	deleteDiploma,
	updateDiploma,
} = require("../controllers/diplomaController");

const { pagination } = require("../middlewares/pagination");
const {
	createChapter,
	addLevelToChapter,
} = require("../controllers/chapterController");

router.delete("/student/meny", deleteMenyStudents);
router.patch("/student/assign/:userId", assignDiploma);
router.route("/student").post(createStudent).get(pagination, getStudents);
router
	.route("/student/:userId")
	.get(getStudent)
	.patch(updateStudent)
	.delete(deleteStudent);

router.patch("/product/gift/:productId", giftProduct);
router.delete("/product/meny", deleteMenyProducts);
router.route("/product").post(createProduct).get(pagination, getProducts);
router
	.route("/product/:productId")
	.get(getProduct)
	.patch(updateProduct)
	.delete(deleteProduct);

router.route("/library").get(getItems).post(createItem);
router
	.route("/library/:itemId")
	.get(getPdfFromCloudinary)
	.patch(updateItem)
	.delete(deleteItem);

router.route("/diploma").post(createDiploma).get(getDiplomas);
router.route("/diploma/:diplomaId").delete(deleteDiploma).patch(updateDiploma);

router.route("/chapter").post(createChapter);
router.route("/chapter/:chapterId").patch(addLevelToChapter);

module.exports = router;

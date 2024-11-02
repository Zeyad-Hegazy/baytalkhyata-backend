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
	createQuizLevel,
} = require("../controllers/chapterController");

const {
	createCategory,
	getCategories,
	createCategoryItem,
	getCategoryItems,
} = require("../controllers/categoryController");

const {
	createFQA,
	updateFQA,
	getQuestionAnswers,
} = require("../controllers/FQAController");

const { createBankQuestion } = require("../controllers/BankQuestionController");

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
router.post("/chapter/quiz", createQuizLevel);

router.route("/category").post(createCategory).get(getCategories);

router.post("/category/item", createCategoryItem);
router.route("/category/item/:categoryId").get(getCategoryItems);

router.route("/FQA").post(createFQA);
router.route("/FQA/:fqaId").patch(updateFQA).get(getQuestionAnswers);

router.post("/bank-questions", createBankQuestion);

module.exports = router;

const express = require("express");

const router = express.Router();

const { getAuthenticatedUser } = require("../controllers/studentController");
const {
	redeemProduct,
	getProducts,
	getProduct,
	getStudentProducts,
} = require("../controllers/productController");

const {
	getStudentDiplomas,
	getBookMarkedDiplomas,
	getStudentAllDiplomas,
	toggleDiplomaBookmark,
	getDiplomaChapters,
} = require("../controllers/diplomaController");

const {
	streamChapterLevelFiles,
	getChapterLevel,
	getQuizLevel,
	completeLevel,
	submitAnswer,
	finishQuiz,
	///////////
	getChapters,
	getChapterLevels,
	getLevelSections,
	getSectionItem,
	completeItem,
} = require("../controllers/chapterController");

const { pagination } = require("../middlewares/pagination");

const { getQuestions } = require("../controllers/FQAController");
const {
	getItems,
	getPdfFromCloudinary,
	downloadPdfFromCloudinary,
} = require("../controllers/libraryController");

const getPoints = require("../middlewares/getPoints");

router.get("/profile", getAuthenticatedUser);

router.patch("/product/redeem/:productId", redeemProduct);
router.get("/product", getPoints, pagination, getProducts);
router.get("/product/owned", getStudentProducts);
router.get("/product/:productId", getProduct);

// new diploma queries
router.get("/chapter/:diplomaId", getChapters);
router.get("/chapter/level/:chapterId", getChapterLevels);
router.get("/chapter/level/section/:levelId", getLevelSections);
router.get("/chapter/level/section/item/:itemId", getSectionItem);
router.patch("/complete/item/:itemId", completeItem);

// old diploma queries
router.get("/diploma/chapter/:chapterId/levels/:levelType", getChapterLevel);

router.get("/diploma/all", getStudentAllDiplomas);
router.get("/diploma", getStudentDiplomas);
router.get("/diploma/bookmark", getBookMarkedDiplomas);
router.patch("/diploma/bookmark/:diplomaId", toggleDiplomaBookmark);
router.get("/diploma/chapter/:diplomaId", getDiplomaChapters);
router.get("/diploma/chapter/quiz/:chapterId", getQuizLevel);
router.patch(
	"/diploma/:diplomaId/chapter/:chapterId/:levelType",
	completeLevel
);
router.patch("/diploma/chapter/quiz/:quizId/answer/:answerId", submitAnswer);
router.patch("/diploma/:diplomaId/chapter/:chapterId/quiz/:quizId", finishQuiz);

///////////////////////////////////////////////////////////////////////////////////////////////

router.get("/FQA", getQuestions);

router.route("/library").get(getItems);
router.route("/library/:itemId").get(getPdfFromCloudinary);
router.route("/library/download/:itemId").get(downloadPdfFromCloudinary);

module.exports = router;

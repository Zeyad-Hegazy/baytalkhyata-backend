const express = require("express");

const router = express.Router();

const {
	getAuthenticatedUser,
	updateProfile,
} = require("../controllers/studentController");
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
	///////////
	getChapters,
	getChapterLevels,
	getLevelSections,
	getSectionItem,
	completeItem,
	getSectionQuiz,
	finishSectionQuiz,
	finishFinalQuiz,
} = require("../controllers/chapterController");

const { pagination } = require("../middlewares/pagination");

const { getQuestions } = require("../controllers/FQAController");

const {
	getItems,
	getPdfFromCloudinary,
	downloadPdfFromCloudinary,
} = require("../controllers/libraryController");

const getPoints = require("../middlewares/getPoints");

const {
	getBankQuestions,
	submitBankQuestionAnswer,
} = require("../controllers/BankQuestionController");

router.route("/profile").get(getAuthenticatedUser).patch(updateProfile);

router.patch("/product/redeem/:productId", redeemProduct);
router.get("/product", getPoints, pagination, getProducts);
router.get("/product/owned", getStudentProducts);
router.get("/product/:productId", getProduct);

router.get("/diploma/all", getStudentAllDiplomas);
router.get("/diploma", getStudentDiplomas);
router.get("/diploma/bookmark", getBookMarkedDiplomas);
router.patch("/diploma/bookmark/:diplomaId", toggleDiplomaBookmark);
router.get("/diploma/chapter/:diplomaId", getDiplomaChapters);
router.get("/diploma/chapter/quiz/:chapterId", getQuizLevel);

// new diploma queries
router.get("/chapter/:diplomaId", getChapters);
router.get("/chapter/level/:chapterId", getChapterLevels);
router.get("/chapter/level/section/:levelId", getLevelSections);
router.get("/chapter/level/section/item/:itemId", getSectionItem);
router.patch("/chapter/quiz/:quizId", finishFinalQuiz);

router.get("/section/quiz/:quizId", getSectionQuiz);
router.patch("/complete/item/:itemId", completeItem);
router.patch("/quiz/submit", submitAnswer);
router.patch("/quiz/finish/:quizId", finishSectionQuiz);

// old diploma queries
router.get("/diploma/chapter/:chapterId/levels/:levelType", getChapterLevel);
router.patch(
	"/diploma/:diplomaId/chapter/:chapterId/:levelType",
	completeLevel
);
///////////////////////////////////////////////////////////////////////////////////////////////

router.get("/FQA", getQuestions);

router.route("/library").get(getItems);
router.route("/library/:itemId").get(getPdfFromCloudinary);
router.route("/library/download/:itemId").get(downloadPdfFromCloudinary);

router
	.route("/bank-questions")
	.get(getBankQuestions)
	.patch(submitBankQuestionAnswer);

module.exports = router;

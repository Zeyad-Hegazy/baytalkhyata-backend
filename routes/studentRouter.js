const express = require("express");

const router = express.Router();

const { getAuthenticatedUser } = require("../controllers/studentController");
const {
	redeemProduct,
	getProducts,
	getProduct,
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
} = require("../controllers/chapterController");

const { pagination } = require("../middlewares/pagination");

router.get("/profile", getAuthenticatedUser);

router.patch("/product/redeem/:productId", redeemProduct);
router.get("/product", pagination, getProducts);
router.get("/product/:productId", getProduct);

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

module.exports = router;

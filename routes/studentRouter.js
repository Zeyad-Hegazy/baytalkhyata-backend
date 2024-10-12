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

const { streamChapterLevelFiles } = require("../controllers/chapterController");

const { pagination } = require("../middlewares/pagination");

router.get("/profile", getAuthenticatedUser);

router.patch("/product/redeem/:productId", redeemProduct);
router.get("/product", pagination, getProducts);
router.get("/product/:productId", getProduct);

router.get(
	"/chapters/:chapterId/levels/:levelType/:fileType",
	streamChapterLevelFiles
);

router.get("/all/diploma", getStudentAllDiplomas);
router.get("/diploma", getStudentDiplomas);
router.get("/diploma/bookmark", getBookMarkedDiplomas);
router.patch("/diploma/bookmark/:diplomaId", toggleDiplomaBookmark);
router.get("/diploma/chapter/:diplomaId", getDiplomaChapters);

module.exports = router;

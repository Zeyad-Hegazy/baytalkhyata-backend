const express = require("express");

const router = express.Router();

const { getAuthenticatedUser } = require("../controllers/studentController");
const {
	redeemProduct,
	getProducts,
	getProduct,
} = require("../controllers/productController");

const { getStudentDiplomas } = require("../controllers/diplomaController");
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

router.get("/diploma", getStudentDiplomas);

module.exports = router;

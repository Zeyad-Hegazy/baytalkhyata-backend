const express = require("express");

const router = express.Router();

const { getAuthenticatedUser } = require("../controllers/userController");
const {
	redeemProduct,
	getProducts,
	getProduct,
} = require("../controllers/productController");

const { pagination } = require("../middlewares/pagination");

router.get("/profile", getAuthenticatedUser);

router.patch("/product/redeem/:productId", redeemProduct);
router.get("/product", pagination, getProducts);
router.get("/product/:productId", getProduct);

module.exports = router;

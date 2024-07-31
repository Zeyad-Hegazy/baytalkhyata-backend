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

router.delete("/user/meny", deleteMenyUsers);
router.patch("/user/assign/:userId", assignDiploma);
router.route("/user").post(createUser).get(pagination, getUsers);
router.route("/user/:userId").get(getUser).delete(deleteUser);

router.patch("/product/gift/:productId", giftProduct);
router.delete("/product/meny", deleteMenyProducts);
router.route("/product").post(createProduct).get(pagination, getProducts);
router
	.route("/product/:productId")
	.get(getProduct)
	.patch(updateProduct)
	.delete(deleteProduct);

module.exports = router;

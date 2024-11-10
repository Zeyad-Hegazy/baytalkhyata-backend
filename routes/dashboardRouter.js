const express = require("express");

const router = express.Router();

const {
	calculateDAU,
	calculateMAU,
	calculateRetentionRate,
	calculateUserGrowthRate,
} = require("../controllers/dashboardController");

router.get("/DAU", calculateDAU);
router.get("/MAU", calculateMAU);
router.get("/retention", calculateRetentionRate);
router.get("/growth", calculateUserGrowthRate);

module.exports = router;

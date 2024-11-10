const express = require("express");

const router = express.Router();

const {
	calculateDAU,
	calculateMAU,
	calculateRetentionRate,
	calculateUserGrowthRate,
	calculateAverageSessionDuration,
	calculateEngagementRate,
	calculateCourseEnrollmentNumbers,
} = require("../controllers/dashboardController");

router.get("/activity/DAU", calculateDAU);
router.get("/activity/MAU", calculateMAU);
router.get("/activity/retention", calculateRetentionRate);
router.get("/activity/growth", calculateUserGrowthRate);

router.get("/engagement/session-duration", calculateAverageSessionDuration);
router.get("/engagement/engagement-rate", calculateEngagementRate);
router.get("/engagement/course-enrollment", calculateCourseEnrollmentNumbers);

module.exports = router;

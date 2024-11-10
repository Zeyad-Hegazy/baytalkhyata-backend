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
	calculateAverageQuizScore,
	calculateQuizPassRate,
	calculateQuizAttemptRate,
	calculateQuizCompletionRate,
	calculateCorrectAnswerRate,
} = require("../controllers/dashboardController");

router.get("/activity/DAU", calculateDAU);
router.get("/activity/MAU", calculateMAU);
router.get("/activity/retention", calculateRetentionRate);
router.get("/activity/growth", calculateUserGrowthRate);

router.get("/engagement/session-duration", calculateAverageSessionDuration);
router.get("/engagement/engagement-rate", calculateEngagementRate);
router.get("/engagement/course-enrollment", calculateCourseEnrollmentNumbers);

router.get("/quiz/average-score", calculateAverageQuizScore);
router.get("/quiz/pass-rate", calculateQuizPassRate);
router.get("/quiz/attempt-rate", calculateQuizAttemptRate);
router.get("/quiz/completion-rate", calculateQuizCompletionRate);
router.get("/quiz/answer-rate", calculateCorrectAnswerRate);

module.exports = router;

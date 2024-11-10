const Student = require("../models/StudentModel");

// User Activity

exports.calculateDAU = async (req, res) => {
	try {
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);

		const dauCount = await Student.countDocuments({
			"loginHistory.login": { $gte: oneDayAgo },
		});

		return res.status(200).json({ dailyActiveUsers: dauCount });
	} catch (error) {
		return res.status(500).json({ message: "Error calculating DAU", error });
	}
};

exports.calculateMAU = async (req, res) => {
	try {
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

		const mauCount = await Student.countDocuments({
			"loginHistory.login": { $gte: oneMonthAgo },
		});

		return res.status(200).json({ monthlyActiveUsers: mauCount });
	} catch (error) {
		return res.status(500).json({ message: "Error calculating MAU", error });
	}
};

exports.calculateRetentionRate = async (req, res) => {
	try {
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		const twoMonthsAgo = new Date();
		twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

		const previousPeriodUsers = await Student.countDocuments({
			"loginHistory.login": { $gte: twoMonthsAgo, $lt: oneMonthAgo },
		});

		const currentPeriodReturningUsers = await Student.countDocuments({
			"loginHistory.login": { $gte: oneMonthAgo },
		});

		let retentionRate = 0;
		if (previousPeriodUsers > 0) {
			retentionRate = (currentPeriodReturningUsers / previousPeriodUsers) * 100;
		}

		return res.status(200).json({ retentionRate: retentionRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating retention rate", error });
	}
};

exports.calculateUserGrowthRate = async (req, res) => {
	try {
		const startOfCurrentMonth = new Date();
		startOfCurrentMonth.setDate(1);

		const startOfLastMonth = new Date();
		startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
		startOfLastMonth.setDate(1);

		const endOfLastMonth = new Date(startOfCurrentMonth);
		endOfLastMonth.setDate(0);

		const newUsersCurrentMonth = await Student.countDocuments({
			createdAt: { $gte: startOfCurrentMonth },
		});

		const newUsersLastMonth = await Student.countDocuments({
			createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
		});

		let growthRate = 0;
		if (newUsersLastMonth > 0) {
			growthRate =
				((newUsersCurrentMonth - newUsersLastMonth) / newUsersLastMonth) * 100;
		} else if (newUsersCurrentMonth > 0) {
			growthRate = 100;
		}

		return res.status(200).json({ userGrowthRate: growthRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating user growth rate", error });
	}
};

// Engagement

exports.calculateAverageSessionDuration = async (req, res) => {
	try {
		const students = await Student.find();
		let totalSessionDuration = 0;
		let sessionCount = 0;

		students.forEach((student) => {
			student.loginHistory.forEach((session) => {
				if (session.logout) {
					const duration = (session.logout - session.login) / (1000 * 60);
					totalSessionDuration += duration;
					sessionCount += 1;
				}
			});
		});

		const averageSessionDuration =
			sessionCount > 0 ? totalSessionDuration / sessionCount : 0;

		return res
			.status(200)
			.json({ averageSessionDuration: averageSessionDuration.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating user growth rate", error });
	}
};

exports.calculateEngagementRate = async (req, res) => {
	try {
		const totalUsers = await Student.countDocuments();
		const engagedUsersCount = await Student.countDocuments({
			$or: [
				{ "enrolledDiplomas.0": { $exists: true } },
				{ "quizesTaken.0": { $exists: true } },
			],
		});

		const engagementRate =
			totalUsers > 0 ? (engagedUsersCount / totalUsers) * 100 : 0;

		return res.status(200).json({ engagementRate: engagementRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating user growth rate", error });
	}
};

exports.calculateCourseEnrollmentNumbers = async (req, res) => {
	try {
		const students = await Student.find();
		let totalEnrollments = 0;

		students.forEach((student) => {
			totalEnrollments += student.enrolledDiplomas.length;
		});

		return res.status(200).json({ totalEnrollments });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating user growth rate", error });
	}
};

// Quizzes

exports.calculateAverageQuizScore = async (req, res) => {
	try {
		const students = await Student.find();
		let totalScore = 0;
		let totalQuizzes = 0;

		students.forEach((student) => {
			student.quizesTaken.forEach((quiz) => {
				totalScore += quiz.score;
				totalQuizzes += 1;
			});
		});

		const averageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

		return res.status(200).json({ averageQuizScore: averageScore.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating average quiz score", error });
	}
};

exports.calculateQuizPassRate = async (req, res) => {
	try {
		const students = await Student.find();
		let passedQuizzes = 0;
		let totalQuizzes = 0;

		students.forEach((student) => {
			student.quizesTaken.forEach((quiz) => {
				if (quiz.passed) passedQuizzes += 1;
				totalQuizzes += 1;
			});
		});

		const passRate =
			totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

		return res.status(200).json({ quizPassRate: passRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating quiz pass rate", error });
	}
};

exports.calculateQuizAttemptRate = async (req, res) => {
	try {
		const students = await Student.find();
		let totalAttempts = 0;
		let totalEnrollments = 0;

		students.forEach((student) => {
			totalAttempts += student.quizesTaken.length;
			totalEnrollments += student.enrolledDiplomas.length;
		});

		const attemptRate =
			totalEnrollments > 0 ? totalAttempts / totalEnrollments : 0;

		return res.status(200).json({ quizAttemptRate: attemptRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating quiz attempt rate", error });
	}
};

exports.calculateQuizCompletionRate = async (req, res) => {
	try {
		const students = await Student.find();
		let completedQuizzes = 0;
		let totalQuizzes = 0;

		students.forEach((student) => {
			student.quizesTaken.forEach((quiz) => {
				if (quiz.score > 0) completedQuizzes += 1;
				totalQuizzes += 1;
			});
		});

		const completionRate =
			totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

		return res
			.status(200)
			.json({ quizCompletionRate: completionRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating quiz completion rate", error });
	}
};

exports.calculateCorrectAnswerRate = async (req, res) => {
	try {
		const students = await Student.find();
		let totalCorrectAnswers = 0;
		let totalQuestions = 0;

		students.forEach((student) => {
			student.quizesTaken.forEach((quiz) => {
				totalCorrectAnswers += quiz.correctAnswers;
				totalQuestions += quiz.submetedAnswers.length;
			});
		});

		const correctAnswerRate =
			totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

		return res
			.status(200)
			.json({ correctAnswerRate: correctAnswerRate.toFixed(2) });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error calculating correct answer rate", error });
	}
};

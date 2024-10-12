exports.calculateCompletionPercentage = (chapters, completedLevels) => {
	const totalLevels = chapters.reduce((acc, chapter) => acc + 5, 0);

	const completedCount = completedLevels.reduce(
		(acc, completedChapter) => acc + completedChapter.levelIds.length,
		0
	);

	const completionPercentage = ((completedCount / totalLevels) * 100).toFixed(
		2
	);
	return completionPercentage;
};

exports.calculateChapterCompletionPercentage = (chapter, completedLevels) => {
	const totalLevels = 5;

	const completedChapter = completedLevels.find(
		(completed) => completed.chapterId.toString() === chapter._id.toString()
	);

	const completedCount = completedChapter
		? completedChapter.levelIds.length
		: 0;

	const completionPercentage = ((completedCount / totalLevels) * 100).toFixed(
		2
	);
	return completionPercentage;
};

exports.calculateTotalPointsForChapter = (chapter, completedLevelIds) => {
	let totalPoints = 0;

	const levels = [
		...chapter.levelOne,
		...chapter.levelTwo,
		...chapter.levelThree,
		...chapter.levelFour,
	];

	levels.forEach((level) => {
		if (completedLevelIds.includes(level._id.toString())) {
			totalPoints += level.points;
		}
	});

	if (
		chapter.levelFive &&
		completedLevelIds.includes(chapter.levelFive.toString())
	) {
		// TODO fetch Quiz model to get it's score
	}

	return totalPoints;
};

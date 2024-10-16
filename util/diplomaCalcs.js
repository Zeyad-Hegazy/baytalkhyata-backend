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

	// Find the completed levels for the specific chapter
	const completedChapter = completedLevels.find(
		(completed) => completed.chapterId.toString() === chapter._id.toString()
	);

	// If the chapter has no completed levels, set completedCount to 0
	let completedCount = 0;
	if (completedChapter) {
		// Mapping the levels by name
		const levelNames = ["levelOne", "levelTwo", "levelThree", "levelFour"];

		// Iterate through the level names to count completed levels
		levelNames.forEach((levelName) => {
			const levels = chapter[levelName];
			levels.forEach((level) => {
				if (completedChapter.levelIds.includes(level._id.toString())) {
					completedCount++;
				}
			});
		});

		// Check if levelFive (quiz) is completed
		if (
			chapter.levelFive &&
			completedChapter.levelIds.includes(chapter.levelFive.toString())
		) {
			completedCount++;
		}
	}

	// Calculate the completion percentage based on the total levels
	const completionPercentage = ((completedCount / totalLevels) * 100).toFixed(
		2
	);
	return completionPercentage;
};

exports.calculateTotalPointsForChapter = (chapter, completedLevelIds) => {
	let totalPoints = 0;

	// Mapping level names to their corresponding arrays in the chapter
	const levelNames = ["levelOne", "levelTwo", "levelThree", "levelFour"];

	// Iterate over each level name and accumulate points if the level ID is completed
	levelNames.forEach((levelName) => {
		const levels = chapter[levelName];
		levels.forEach((level) => {
			if (completedLevelIds.includes(level._id.toString())) {
				totalPoints += level.points;
			}
		});
	});

	// Handle the levelFive separately (Quiz)
	if (
		chapter.levelFive &&
		completedLevelIds.includes(chapter.levelFive.toString())
	) {
		// TODO: Fetch the Quiz model to get its score
		// Assuming you have a function to fetch the quiz points based on its ID
		// const quizPoints = await fetchQuizPoints(chapter.levelFive);
		// totalPoints += quizPoints;
	}

	return totalPoints;
};

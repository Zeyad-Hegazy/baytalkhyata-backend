const moment = require("moment");

const formatDate = (date) => {
	const now = moment();
	const dateMoment = moment(date);
	const duration = moment.duration(now.diff(dateMoment));

	if (duration.asMinutes() < 1) {
		return "Just Now";
	} else if (duration.asHours() < 1) {
		return `${Math.floor(duration.asMinutes())}m ago`;
	} else if (duration.asDays() < 1) {
		return `${Math.floor(duration.asHours())}h ago`;
	} else if (duration.asWeeks() < 1) {
		return `${Math.floor(duration.asDays())}d ago`;
	} else if (duration.asMonths() < 1) {
		return `${Math.floor(duration.asWeeks())}w ago`;
	} else {
		return `${Math.floor(duration.asMonths())}mo ago`;
	}
};

module.exports = formatDate;

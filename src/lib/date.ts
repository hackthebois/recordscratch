import dayjs from "dayjs";
import DurationPlugin from "dayjs/plugin/duration";
import RelativeTimePlugin from "dayjs/plugin/relativeTime";
import TimezonePlugin from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(RelativeTimePlugin);
dayjs.extend(DurationPlugin);
dayjs.extend(TimezonePlugin);
dayjs.extend(utc);

export const timeAgo = (date: Date): string => {
	// Parse the date string into a dayjs object with UTC
	const parsedDate = dayjs.utc(date);

	// Ensure parsed date is valid
	if (!parsedDate.isValid()) {
		console.error("Invalid Date");
		return "Invalid Date";
	}

	const guessedTimezone = dayjs.tz.guess();

	// Use dayjs.tz to convert the parsedDate to the guessed timezone
	const formattedDate = dayjs.tz(parsedDate, guessedTimezone);

	return formattedDate.fromNow();
};

export const isToday = (date: Date, tz: string): boolean => {
	const now = dayjs().tz(tz);
	return dayjs(date).tz(tz).isSame(now, "day");
};

export const isYesterday = (date: Date, tz: string): boolean => {
	const yesterday = dayjs().tz(tz).subtract(1, "day");
	return dayjs(date).tz(tz).isSame(yesterday, "day");
};

export const formatDuration = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);

	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	} else {
		return `${seconds}s`;
	}
};

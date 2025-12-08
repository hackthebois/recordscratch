import { followers, getDB, likes, profile, ratings } from "@recordscratch/db";
import dayjs from "dayjs";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";

type MetaInput = {
	db: ReturnType<typeof getDB>;
	userId: string;
};

export const getTotalLikes = async ({ db, userId }: MetaInput) => {
	return (
		await db
			.select({
				total: count(likes.authorId),
			})
			.from(likes)
			.where(eq(likes.authorId, userId))
	)[0].total;
};

export const getTotalRatings = async ({ db, userId }: MetaInput) => {
	const total = await db
		.select({ total: count(ratings.rating) })
		.from(ratings)
		.where(eq(ratings.userId, userId));

	if (total) return total[0].total;
	else 0;
};

export const getStreak = async ({ db, userId }: MetaInput) => {
	const ratingsList = await db.query.ratings.findMany({
		where: and(eq(ratings.userId, userId), isNotNull(ratings.createdAt)),
		orderBy: desc(ratings.createdAt),
	});

	if (ratingsList.length === 0) {
		return 0;
	}

	if (
		dayjs(dayjs().format("YYYY-MM-DD")).diff(
			dayjs(ratingsList[0].createdAt).format("YYYY-MM-DD"),
			"day",
		) > 1
	) {
		return 0;
	}

	// USE FOR RATING LOG
	const groupedDays = new Map<string, number>();

	ratingsList.forEach((rating) => {
		const date = dayjs(rating.createdAt).format("YYYY-MM-DD");
		if (groupedDays.has(date)) {
			const current = groupedDays.get(date);
			groupedDays.set(date, current ? current + 1 : 1);
		} else {
			groupedDays.set(date, 1);
		}
	});

	const days = Array.from(groupedDays.keys());

	let streak = 1;

	for (let i = 0; i < days.length; i++) {
		if (i === days.length - 1) {
			streak++;
			break;
		}

		const current = dayjs(days[i]);
		const next = dayjs(days[i + 1]);

		if (current.diff(next, "day") <= 2) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
};

export const getTotalFollowers = async ({ db, userId }: MetaInput) => {
	return await db
		.select({
			count: sql<number>`count(*)`.mapWith(Number),
		})
		.from(followers)
		.innerJoin(
			profile,
			and(
				eq(profile.deactivated, false),
				eq(followers.userId, profile.userId),
			),
		)
		.where(and(eq(followers.followingId, userId)))
		.then((result) => (result ? result[0].count : 0));
};

export const getTotalFollowing = async ({ db, userId }: MetaInput) => {
	return await db
		.select({
			count: sql<number>`count(*)`.mapWith(Number),
		})
		.from(followers)
		.innerJoin(
			profile,
			and(
				eq(profile.deactivated, false),
				eq(followers.userId, profile.userId),
			),
		)
		.where(and(eq(followers.userId, userId)))
		.then((result) => (result ? result[0].count : 0));
};

import {
	commentNotifications,
	comments,
	followers,
	followNotifications,
	getDB,
	likeNotifications,
	likes,
	listResources,
	lists,
	profile,
	pushTokens,
	ratings,
	sessions,
	users,
} from "@recordscratch/db";
import type { ServerEnv } from "@recordscratch/types";
import { Hono } from "hono";
import { getAuth, getSession } from "../lib/auth";
import { HTTPException } from "hono/http-exception";
import {
	invalidateSession,
	setSessionCookie,
	validateSessionToken,
} from "@recordscratch/auth";
import { eq, inArray, or } from "drizzle-orm";

export const authHandler = new Hono<{ Bindings: ServerEnv }>();

authHandler.get("/me", async (c) => {
	const db = getDB(c.env.DATABASE_URL);
	const sessionId = getSession(c);
	if (!sessionId) return c.json({ user: null });
	const { user } = await validateSessionToken(c, sessionId);

	if (!user) {
		// Invalidate session if user is not found
		setSessionCookie(c, undefined);
		return c.json({ user: null });
	}

	const existingUser = await db.query.users.findFirst({
		where: eq(users.id, user.id),
		with: {
			profile: true,
			pushTokens: true,
		},
	});

	const expoPushToken = c.req.header("Expo-Push-Token");

	// Insert the expo push token
	if (
		expoPushToken &&
		// Only insert the token if the user exists
		existingUser &&
		// Don't insert the same token twice
		!existingUser?.pushTokens.find((token) => token.token === expoPushToken)
	) {
		await db
			.insert(pushTokens)
			.values({ token: expoPushToken, userId: user.id });
		return c.json({
			user: {
				...existingUser,
				pushTokens: [...existingUser.pushTokens, expoPushToken],
			},
		});
	}

	return c.json({ user: existingUser });
});

authHandler.delete("/delete", async (c) => {
	const { user } = await getAuth(c);

	// Delete user ratings and comments
	const db = getDB(c.env.DATABASE_URL);
	await Promise.all([
		// Delete comments from user or to user
		db
			.delete(comments)
			.where(
				or(
					eq(comments.authorId, user.id),
					eq(comments.userId, user.id),
				),
			),
		// Delete followers and following
		db
			.delete(followers)
			.where(
				or(
					eq(followers.userId, user.id),
					eq(followers.followingId, user.id),
				),
			),
		// Delete list resources based on list owner
		async () => {
			const listsList = await db.query.lists.findMany({
				where: eq(lists.userId, user.id),
				with: {
					resources: true,
				},
			});
			const listIds = listsList.map(({ id }) => id);
			await db
				.delete(listResources)
				.where(inArray(listResources.listId, listIds));
		},
		// Delete likes from user or to user
		db
			.delete(likes)
			.where(or(eq(likes.userId, user.id), eq(likes.authorId, user.id))),
		// Delete notifications from user or to user
		db
			.delete(commentNotifications)
			.where(
				or(
					eq(commentNotifications.userId, user.id),
					eq(commentNotifications.fromId, user.id),
				),
			),
		db
			.delete(followNotifications)
			.where(
				or(
					eq(followNotifications.userId, user.id),
					eq(followNotifications.fromId, user.id),
				),
			),
		db
			.delete(likeNotifications)
			.where(
				or(
					eq(likeNotifications.userId, user.id),
					eq(likeNotifications.fromId, user.id),
				),
			),
		// Delete sessions
		db.delete(sessions).where(eq(sessions.userId, user.id)),
		// Delete push tokens
		db.delete(pushTokens).where(eq(pushTokens.userId, user.id)),
		// Delete profile
		db.delete(profile).where(eq(profile.userId, user.id)),
		// Delete lists
		db.delete(lists).where(eq(lists.userId, user.id)),
		// Delete ratings
		db.delete(ratings).where(eq(ratings.userId, user.id)),
		// Delete user
		db.delete(users).where(eq(users.id, user.id)),
	]);

	return c.json({ success: true });
});

authHandler.get("/signout", async (c) => {
	const session = getSession(c);
	if (!session) throw new HTTPException(401, { message: "Unauthorized" });

	setSessionCookie(c, undefined);
	await invalidateSession(c, session);

	const expoPushToken = c.req.header("Expo-Push-Token");
	// If expo push token, delete it to prevent signed out notifications
	if (expoPushToken) {
		const db = getDB(c.env.DATABASE_URL);

		await db.delete(pushTokens).where(eq(pushTokens.token, expoPushToken));
	}

	return c.json({ success: true });
});

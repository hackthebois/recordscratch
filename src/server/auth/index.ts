import { Context, Hono } from "hono";
import {
	invalidateSession,
	setSessionCookie,
	validateSessionToken,
} from "@/server/auth/config";
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
} from "@/server/db";
import { eq, inArray, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";

const getSession = (c: Context) => {
	const query = c.req.query();
	return (
		(query.sessionId as string | undefined) ??
		c.req.header("Authorization") ??
		getCookie(c, "session")
	);
};

export const authHandler = new Hono()
	.get("/me", async (c) => {
		const db = getDB();
		const sessionId = getSession(c);
		if (!sessionId) return c.json({ user: null });

		const { user } = await validateSessionToken(sessionId);

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
			!existingUser?.pushTokens.find(
				(token) => token.token === expoPushToken,
			)
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
	})
	.delete("/delete", async (c) => {
		const session = getSession(c);
		if (!session) throw new HTTPException(401, { message: "Unauthorized" });
		const { user } = await validateSessionToken(session);

		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		// Delete user ratings and comments
		const db = getDB();
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
				.where(
					or(eq(likes.userId, user.id), eq(likes.authorId, user.id)),
				),
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
	})
	.get("/signout", async (c) => {
		const session = getSession(c);
		if (!session) throw new HTTPException(401, { message: "Unauthorized" });

		setSessionCookie(c, undefined);
		await invalidateSession(session);

		const expoPushToken = c.req.header("Expo-Push-Token");
		// If expo push token, delete it to prevent signed out notifications
		if (expoPushToken) {
			const db = getDB();

			await db
				.delete(pushTokens)
				.where(eq(pushTokens.token, expoPushToken));
		}

		return c.json({ success: true });
	});

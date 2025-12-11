import {
	commentNotifications,
	comments,
	followers,
	followNotifications,
	likeNotifications,
	likes,
	users as userTable,
	type DB,
} from "@recordscratch/db";
import {
	parseCommentNotification,
	parseFollowNotification,
	parseLikeNotification,
} from "@recordscratch/lib";
import type {
	CreateCommentNotification,
	CreateFollowNotification,
	CreateLikeNotification,
	PushToken,
	User,
} from "@recordscratch/types";
import "dotenv/config"; // Ensures env vars are loaded first
import { and, eq, inArray } from "drizzle-orm";
import type { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { v4 as uuidv4 } from "uuid";

// Custom ExpoClient class to replace Expo SDK
const Expo = (accessToken?: string) => {
	const chunkPushNotifications = (notifications: ExpoPushMessage[]) => {
		const chunks: ExpoPushMessage[][] = [];
		const chunkSize = 100; // Expo's recommended chunk size

		for (let i = 0; i < notifications.length; i += chunkSize) {
			chunks.push(notifications.slice(i, i + chunkSize));
		}

		return chunks;
	};

	const sendPushNotificationsAsync = async (messages: ExpoPushMessage[]) => {
		const response = await fetch("https://exp.host/--/api/v2/push/send", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...(accessToken
					? { Authorization: `Bearer ${accessToken}` }
					: {}),
			},
			body: JSON.stringify(messages),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return (await response.json()) as {
			data: ExpoPushTicket[];
		};
	};

	return {
		chunkPushNotifications,
		sendPushNotificationsAsync,
	};
};

// Replace Expo instantiation with our custom client
export const sendPushNotifications = async ({
	users,
	messages,
	db,
}: {
	users:
		| (User & {
				pushTokens: PushToken[];
		  })[]
		| string[];
	messages: {
		title: ExpoPushMessage["title"];
		body: ExpoPushMessage["body"];
		data: ExpoPushMessage["data"];
	}[];
	db: DB;
}) => {
	const expo = Expo(process.env.EXPO_ACCESS_TOKEN);
	// If users is an array of user ids, fetch the users from the database
	let usersList: (User & {
		pushTokens: PushToken[];
	})[] = [];
	if (users.every((item) => typeof item === "string")) {
		const u = await db.query.users.findMany({
			where: inArray(userTable.id, users),
			with: {
				pushTokens: true,
			},
		});
		usersList = u;
	} else {
		usersList = users;
	}

	// Filter users that have notifications enabled and have an expo push token
	const pushTokens = usersList
		.filter(
			(user) => user.notificationsEnabled && user.pushTokens.length > 0,
		)
		.flatMap((user) => user.pushTokens.map((token) => token.token));

	// Create the notifications
	let notifications: ExpoPushMessage[] = [];
	pushTokens.forEach((token) => {
		messages.forEach((message) => {
			notifications.push({
				to: token,
				sound: "default",
				...message,
			});
		});
	});

	// Chunk the notifications
	let chunks = expo.chunkPushNotifications(notifications);
	let tickets = [];

	for (let chunk of chunks) {
		try {
			let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
			tickets.push(...ticketChunk.data);
		} catch (error) {
			console.error(error);
		}
	}

	return tickets;
};

export const createCommentNotification = async (db: DB, commentId: string) => {
	const comment = await db.query.comments.findFirst({
		where: eq(comments.id, commentId),
		with: {
			parent: {
				with: {
					profile: {
						with: {
							user: {
								with: {
									pushTokens: true,
								},
							},
						},
					},
				},
			},
			profile: {
				with: {
					user: true,
				},
			},
			author: {
				with: {
					user: {
						with: {
							pushTokens: true,
						},
					},
				},
			},
		},
	});

	if (
		!comment ||
		// Don't send notifications if the reply is to yourself
		comment.parent?.userId === comment.userId ||
		// Don't send notifications if the comment is to yourself
		comment.author.userId === comment.userId
	)
		return;

	const type = comment.parent ? "REPLY" : "COMMENT";
	const messageReceiver =
		type === "REPLY" ? comment.parent!.profile : comment.author;
	const messageGiver = comment.profile;

	const notification: CreateCommentNotification & { id: string } = {
		id: uuidv4(),
		type,
		fromId: messageGiver.userId,
		userId: messageReceiver.userId,
		commentId,
	};

	const message = parseCommentNotification({
		comment,
		profile: messageGiver,
		handle: messageReceiver.handle,
		notification,
	});

	await Promise.all([
		db.insert(commentNotifications).values(notification),
		sendPushNotifications({
			users: [messageReceiver.user],
			messages: [message],
			db,
		}),
	]);
};

export const createFollowNotification = async (
	db: DB,
	notification: CreateFollowNotification,
) => {
	const [existingNotification, follow] = await Promise.all([
		db.query.followNotifications.findFirst({
			where: and(
				eq(followNotifications.userId, notification.userId),
				eq(followNotifications.fromId, notification.fromId),
			),
		}),
		db.query.followers.findFirst({
			where: and(
				eq(followers.userId, notification.fromId),
				eq(followers.followingId, notification.userId),
			),
			with: {
				following: {
					with: {
						user: {
							with: {
								pushTokens: true,
							},
						},
					},
				},
				follower: true,
			},
		}),
	]);

	if (!follow) return;

	const { following, follower } = follow;

	await Promise.all([
		db
			.insert(followNotifications)
			.values({
				...notification,
			})
			.onConflictDoUpdate({
				target: [
					followNotifications.userId,
					followNotifications.fromId,
				],
				set: {
					updatedAt: new Date(),
				},
			}),
		...(!existingNotification
			? [
					sendPushNotifications({
						users: [following.user],
						messages: [
							parseFollowNotification({
								profile: follower,
								notification,
							}),
						],
						db,
					}),
				]
			: []),
	]);
};

export const createLikeNotification = async (
	db: DB,
	notification: CreateLikeNotification,
) => {
	// Don't send notifications if the user is liking their own rating
	if (notification.userId === notification.fromId) return;

	const [existingNotification, like] = await Promise.all([
		db.query.likeNotifications.findFirst({
			where: and(
				eq(likeNotifications.userId, notification.userId),
				eq(likeNotifications.fromId, notification.fromId),
				eq(likeNotifications.resourceId, notification.resourceId),
			),
		}),
		db.query.likes.findFirst({
			where: and(
				eq(likes.authorId, notification.userId),
				eq(likes.resourceId, notification.resourceId),
				eq(likes.userId, notification.fromId),
			),
			with: {
				author: {
					with: {
						user: {
							with: {
								pushTokens: true,
							},
						},
					},
				},
				profile: true,
				rating: true,
			},
		}),
	]);

	if (!like) return;

	await Promise.all([
		db
			.insert(likeNotifications)
			.values(notification)
			.onConflictDoUpdate({
				target: [
					likeNotifications.userId,
					likeNotifications.fromId,
					likeNotifications.resourceId,
				],
				set: {
					updatedAt: new Date(),
				},
			}),
		...(!existingNotification
			? [
					sendPushNotifications({
						users: [like.author.user],
						messages: [
							parseLikeNotification({
								rating: like.rating,
								profile: like.profile,
								handle: like.author.handle,
								notification,
							}),
						],
						db,
					}),
				]
			: []),
	]);
};

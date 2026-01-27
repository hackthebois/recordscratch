import {
	commentNotifications,
	followNotifications,
	likeNotifications,
} from "@/server/db";
import { NotificationDataSchema } from "@/lib/notifications";
import { and, count, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";

export const notificationsRouter = router({
	get: protectedProcedure.query(async ({ ctx: { db, userId } }) => {
		const [commentNotifs, followNotifs, likeNotifs] = await Promise.all([
			db.query.commentNotifications.findMany({
				where: eq(commentNotifications.userId, userId),
				with: {
					profile: true,
					comment: true,
				},
				orderBy: [desc(commentNotifications.createdAt)],
			}),
			db.query.followNotifications.findMany({
				where: eq(followNotifications.userId, userId),
				with: {
					profile: true,
				},
				orderBy: [desc(followNotifications.createdAt)],
			}),
			db.query.likeNotifications.findMany({
				where: eq(likeNotifications.userId, userId),
				with: {
					profile: true,
					rating: true,
				},
				orderBy: [desc(likeNotifications.createdAt)],
			}),
		]);

		const allNotifications = [
			...commentNotifs
				.map((notif) => ({
					...notif,
					notifType: "comment" as const,
				}))
				.filter((notif) => notif.comment),
			...followNotifs.map((notif) => ({
				...notif,
				notifType: "follow" as const,
			})),
			...likeNotifs.map((notif) => ({
				...notif,
				notifType: "like" as const,
			})),
		];

		allNotifications.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);

		return allNotifications;
	}),
	getUnseen: protectedProcedure.query(async ({ ctx: { db, userId } }) => {
		const notifications = await db
			.select({
				comments: count(commentNotifications.id),
				follows: count(followNotifications.fromId),
				likes: count(likeNotifications.fromId),
			})
			.from(commentNotifications)
			.fullJoin(
				followNotifications,
				and(
					eq(followNotifications.userId, userId),
					eq(followNotifications.seen, false),
				),
			)
			.fullJoin(
				likeNotifications,
				and(
					eq(likeNotifications.userId, userId),
					eq(likeNotifications.seen, false),
				),
			)
			.where(
				and(
					eq(commentNotifications.userId, userId),
					eq(commentNotifications.seen, false),
				),
			);

		return (
			notifications[0].comments +
			notifications[0].follows +
			notifications[0].likes
		);
	}),
	markAllSeen: protectedProcedure.mutation(
		async ({ ctx: { db, userId } }) => {
			await Promise.all([
				db
					.update(commentNotifications)
					.set({ seen: true })
					.where(
						and(
							eq(commentNotifications.userId, userId),
							eq(commentNotifications.seen, false),
						),
					),
				db
					.update(followNotifications)
					.set({ seen: true })
					.where(
						and(
							eq(followNotifications.userId, userId),
							eq(followNotifications.seen, false),
						),
					),
				db
					.update(likeNotifications)
					.set({ seen: true })
					.where(
						and(
							eq(likeNotifications.userId, userId),
							eq(likeNotifications.seen, false),
						),
					),
			]);
		},
	),
	markSeen: protectedProcedure
		.input(NotificationDataSchema)
		.mutation(async ({ ctx: { db, userId }, input }) => {
			switch (input.type) {
				case "COMMENT":
					await db
						.update(commentNotifications)
						.set({ seen: true })
						.where(
							and(
								eq(commentNotifications.id, input.data.id!),
								eq(commentNotifications.userId, userId),
							),
						);
					break;
				case "FOLLOW":
					await db
						.update(followNotifications)
						.set({ seen: true })
						.where(
							and(
								eq(
									followNotifications.fromId,
									input.data.fromId,
								),
								eq(followNotifications.userId, userId),
							),
						);
					break;
				case "LIKE":
					await db
						.update(likeNotifications)
						.set({ seen: true })
						.where(
							and(
								eq(likeNotifications.fromId, input.data.fromId),
								eq(likeNotifications.userId, userId),
							),
						);
					break;
			}
		}),
});

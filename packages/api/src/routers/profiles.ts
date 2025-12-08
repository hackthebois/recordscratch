import { followers, profile, ratings, sessions } from "@recordscratch/db";
import {
	CreateProfileSchema,
	DeactivateProfileSchema,
	UpdateProfileSchema,
} from "@recordscratch/types";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
	moderatorProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../trpc";

import { RatingSchema } from "@recordscratch/types";
import { createFollowNotification } from "../notifications";
import { posthog } from "../posthog";
import { PaginatedInput } from "../utils";
import {
	getStreak,
	getTotalFollowers,
	getTotalFollowing,
	getTotalLikes,
	getTotalRatings,
} from "../lib/profile";

export const profilesRouter = router({
	get: publicProcedure
		.input(z.string())
		.query(async ({ ctx: { db }, input: handle }) => {
			const p = await db.query.profile.findFirst({
				where: eq(profile.handle, handle),
			});

			if (!p) return null;

			const metaInput = { db, userId: p.userId };
			const [
				totalLikes,
				streak,
				totalFollowers,
				totalFollowing,
				totalRatings,
			] = await Promise.all([
				getTotalLikes(metaInput),
				getStreak(metaInput),
				getTotalFollowers(metaInput),
				getTotalFollowing(metaInput),
				getTotalRatings(metaInput),
			]);

			return {
				...p,
				meta: {
					streak,
					totalLikes,
					totalFollowers,
					totalFollowing,
					totalRatings,
				},
			};
		}),
	me: publicProcedure.query(async ({ ctx: { db, userId } }) => {
		if (!userId) return null;

		return (
			(await db.query.profile.findFirst({
				where: eq(profile.userId, userId),
			})) ?? null
		);
	}),
	needsOnboarding: publicProcedure.query(async ({ ctx: { db, userId } }) => {
		if (!userId) return false;

		return !(await db.query.profile.findFirst({
			where: eq(profile.userId, userId),
		}));
	}),
	distribution: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				category: RatingSchema.shape.category.optional(),
			}),
		)
		.query(async ({ ctx: { db }, input: { userId, category } }) => {
			let where;
			if (category)
				where = and(
					eq(ratings.userId, userId),
					eq(ratings.category, category),
				);
			else where = eq(ratings.userId, userId);
			const userRatings = await db
				.select({
					rating: ratings.rating,
					rating_count: count(ratings.rating),
				})
				.from(ratings)
				.where(where)
				.groupBy(ratings.rating)
				.orderBy(ratings.rating);

			const outputList: number[] = userRatings.reduce(
				(result, { rating, rating_count }) => {
					result[rating - 1] = rating_count;
					return result;
				},
				Array(10).fill(0),
			);

			return outputList;
		}),
	isFollowing: protectedProcedure
		.input(z.string())
		.query(async ({ ctx: { db, userId }, input: followingId }) => {
			if (!userId || userId === followingId) return false;

			return !!(await db.query.followers.findFirst({
				where: and(
					eq(followers.userId, userId),
					eq(followers.followingId, followingId),
				),
			}));
		}),
	followProfiles: publicProcedure
		.input(
			z.object({
				profileId: z.string(),
				type: z.literal("followers").or(z.literal("following")),
			}),
		)
		.query(async ({ ctx: { db, userId }, input: { profileId, type } }) => {
			const userExists = !!(await db.query.profile.findFirst({
				where: eq(profile.userId, profileId),
			}));

			if (!userExists) throw new Error("User Doesn't Exist");

			let data;
			if (type === "followers") {
				data = await db.query.followers
					.findMany({
						where: and(eq(followers.followingId, profileId)),
						with: {
							follower: {
								extras: {
									isFollowing:
										sql<boolean>`exists(select 1 from followers where user_id = ${userId} and following_id = ${followers.userId})`.as(
											"isFollowing",
										),
								},
							},
						},
					})
					.then((data) => {
						return data.map(
							({ follower: profile, userId, followingId }) => {
								if (profile.deactivated) return null;
								return {
									userId,
									followingId,
									profile,
								};
							},
						);
					});
			} else {
				data = await db.query.followers
					.findMany({
						where: eq(followers.userId, profileId),
						with: {
							following: {
								extras: {
									isFollowing:
										sql<boolean>`exists(select 1 from followers where user_id = ${userId} and following_id = ${followers.userId})`.as(
											"isFollowing",
										),
								},
							},
						},
					})
					.then((data) => {
						return data.map(
							({ following: profile, userId, followingId }) => {
								if (profile.deactivated) return null;
								return {
									userId,
									followingId,
									profile,
								};
							},
						);
					});
			}
			return data;
		}),
	create: protectedProcedure
		.input(CreateProfileSchema)
		.mutation(async ({ ctx: { db, userId, ph }, input }) => {
			const newProfile = await db
				.insert(profile)
				.values({
					...input,
					userId,
				})
				.returning();
			await posthog(ph, [
				[
					"profile_created",
					{
						distinctId: userId,
						properties: input,
					},
				],
			]);
			return newProfile[0]!;
		}),
	update: protectedProcedure
		.input(UpdateProfileSchema)
		.mutation(async ({ ctx: { db, userId }, input: newProfile }) => {
			const p = await db
				.update(profile)
				.set({
					...newProfile,
					updatedAt: new Date(),
				})
				.where(eq(profile.userId, userId))
				.returning();
			return p[0]!;
		}),
	deactivate: moderatorProcedure
		.input(DeactivateProfileSchema)
		.mutation(async ({ ctx: { db }, input: { userId } }) => {
			await db
				.update(profile)
				.set({
					updatedAt: new Date(),
					deactivated: true,
				})
				.where(eq(profile.userId, userId));
			await db.delete(sessions).where(eq(sessions.userId, userId));
		}),
	activate: moderatorProcedure
		.input(DeactivateProfileSchema)
		.mutation(async ({ ctx: { db }, input: { userId } }) => {
			await db
				.update(profile)
				.set({
					updatedAt: new Date(),
					deactivated: false,
				})
				.where(eq(profile.userId, userId));
		}),
	getSignedURL: protectedProcedure
		.input(
			z.object({
				type: z.string(),
				size: z.number(),
			}),
		)
		.mutation(
			async ({
				ctx: {
					userId,
					r2,
					c: { env },
				},
				input: { type, size },
			}) => {
				const res = await r2.sign(
					`${env.R2_ENDPOINT}/profile-images/${userId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": type,
							"Content-Length": `${size}`,
						},
						aws: {
							signQuery: true,
						},
					},
				);

				return res.url;
			},
		),
	follow: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db, userId }, input: followingId }) => {
			if (userId === followingId)
				throw new Error("User Cannot Follow Themselves");

			await db
				.insert(followers)
				.values({ userId, followingId })
				.onConflictDoNothing();
			await createFollowNotification(db, {
				fromId: userId,
				userId: followingId,
			});
		}),
	unFollow: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db, userId }, input: followingId }) => {
			if (userId === followingId)
				throw new Error("User Cannot unFollow Themselves");

			const followExists =
				(
					await db
						.select()
						.from(followers)
						.where(
							and(
								eq(followers.userId, userId),
								eq(followers.followingId, followingId),
							),
						)
				).length > 0;

			if (!followExists) throw new Error("User Doesn't Follow");
			else
				await db
					.delete(followers)
					.where(
						and(
							eq(followers.userId, userId),
							eq(followers.followingId, followingId),
						),
					);
		}),
	handleExists: publicProcedure
		.input(z.string())
		.mutation(async ({ ctx: { db }, input: handle }) => {
			return !!(await db.query.profile.findFirst({
				where: eq(profile.handle, handle),
			}));
		}),
	search: publicProcedure
		.input(PaginatedInput.extend({ query: z.string() }))
		.query(
			async ({
				ctx: { db },
				input: { query, limit = 10, cursor = 0 },
			}) => {
				const items = await db.query.profile.findMany({
					where: or(
						ilike(profile.handle, `%${query}%`),
						ilike(profile.name, `%${query}%`),
					),
					limit: limit + 1,
					offset: cursor,
				});
				let nextCursor: typeof cursor | undefined = undefined;
				if (items.length > limit) {
					items.pop();
					nextCursor = cursor + items.length;
				}
				return { items, nextCursor };
			},
		),
});

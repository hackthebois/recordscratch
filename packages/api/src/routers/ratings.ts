import {
	comments,
	followers,
	getDB,
	likes,
	profile,
	ratings,
} from "@recordscratch/db";
import {
	DeactivateRatingSchema,
	FeedFiltersSchema,
	RateFormSchema,
	ResourceSchema,
	ReviewFormSchema,
} from "@recordscratch/types";
import {
	and,
	avg,
	count,
	desc,
	eq,
	gt,
	inArray,
	isNotNull,
	isNull,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { posthog } from "../posthog";
import {
	moderatorProcedure,
	protectedProcedure,
	publicProcedure,
	router,
} from "../trpc";
import { PaginatedInput } from "../utils";

const RatingAlgorithm = (countWeight: number) => {
	return sql`ROUND(AVG(${ratings.rating}), 1) + ${countWeight} * LN(COUNT(${ratings.rating}))`;
};

const getFollowingWhere = async (
	db: ReturnType<typeof getDB>,
	userId: string,
) => {
	const following = await db.query.followers.findMany({
		where: eq(followers.userId, userId),
	});

	if (following.length === 0) return undefined;

	return inArray(
		ratings.userId,
		following.map((f) => f.followingId),
	);
};

export const ratingsRouter = router({
	get: publicProcedure
		.input(ResourceSchema.pick({ resourceId: true, category: true }))
		.query(async ({ ctx: { db }, input: { resourceId, category } }) => {
			const where =
				category === "ARTIST"
					? and(
							eq(ratings.parentId, resourceId),
							eq(ratings.category, "ALBUM"),
							eq(ratings.deactivated, false),
						)
					: and(
							eq(ratings.resourceId, resourceId),
							eq(ratings.category, category),
							eq(ratings.deactivated, false),
						);

			const rating = await db
				.select({
					average: avg(ratings.rating),
					total: count(ratings.rating),
				})
				.from(ratings)
				.where(where);
			return rating[0].average ? rating[0] : null;
		}),
	getList: publicProcedure
		.input(
			z.object({
				resourceIds: z.string().array(),
				category: z.enum(["ALBUM", "SONG", "ARTIST"]),
			}),
		)
		.query(async ({ ctx: { db }, input: { resourceIds, category } }) => {
			return await db
				.select({
					average: avg(ratings.rating),
					total: count(ratings.rating),
					resourceId: ratings.resourceId,
				})
				.from(ratings)
				.where(
					and(
						inArray(ratings.resourceId, resourceIds),
						eq(ratings.category, category),
						eq(ratings.deactivated, false),
					),
				)
				.groupBy(ratings.resourceId);
		}),
	count: publicProcedure
		.input(
			ResourceSchema.pick({ resourceId: true, category: true }).extend({
				onlyReviews: z.boolean().optional(),
			}),
		)
		.query(
			async ({
				ctx: { db },
				input: { resourceId, category, onlyReviews },
			}) => {
				const total = await db
					.select({ total: count(ratings.rating) })
					.from(ratings)
					.where(
						and(
							eq(ratings.resourceId, resourceId),
							eq(ratings.category, category),
							eq(ratings.deactivated, false),
							onlyReviews
								? isNotNull(ratings.content)
								: undefined,
						),
					)
					.then(([result]) => result.total);
				return total;
				// const total = await db.query.ratings.findMany({
				// 	where: and(
				// 		eq(ratings.resourceId, resourceId),
				// 		eq(ratings.category, category),
				// 		eq(ratings.deactivated, false),
				// 		onlyReviews ? isNotNull(ratings.content) : undefined,
				// 	),
				// });
				// return total.length;
			},
		),
	trending: publicProcedure.query(async ({ ctx: { db } }) => {
		return await db
			.select({
				total: count(ratings.rating),
				resourceId: ratings.resourceId,
			})
			.from(ratings)
			.innerJoin(
				profile,
				and(
					eq(ratings.userId, profile.userId),
					eq(profile.deactivated, false),
				),
			)
			.where(
				and(
					eq(ratings.category, "ALBUM"),
					// gt(
					// 	ratings.createdAt,
					// 	new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
					// ),
					eq(ratings.deactivated, false),
				),
			)
			.groupBy(ratings.resourceId)
			.orderBy(({ total }) => desc(total))
			.limit(20);
	}),
	top: publicProcedure.query(async ({ ctx: { db } }) => {
		const data = await db
			.select({
				total: count(ratings.rating),
				average: avg(ratings.rating),
				resourceId: ratings.resourceId,
				sortValue: RatingAlgorithm(0.3),
			})
			.from(ratings)
			.innerJoin(
				profile,
				and(
					eq(ratings.userId, profile.userId),
					eq(profile.deactivated, false),
				),
			)
			.where(
				and(
					eq(ratings.category, "ALBUM"),
					eq(ratings.deactivated, false),
				),
			)
			.groupBy(ratings.resourceId)
			.orderBy(({ sortValue }) => desc(sortValue))
			.having(({ total }) => gt(total, 5))
			.limit(20);
		return data;
	}),
	popular: publicProcedure.query(async ({ ctx: { db } }) => {
		return await db
			.select({
				total: count(ratings.rating),
				resourceId: ratings.resourceId,
			})
			.from(ratings)
			.innerJoin(
				profile,
				and(
					eq(ratings.userId, profile.userId),
					eq(profile.deactivated, false),
				),
			)
			.where(
				and(
					eq(ratings.category, "ALBUM"),
					eq(ratings.deactivated, false),
				),
			)
			.groupBy(ratings.resourceId)
			.orderBy(({ total }) => desc(total))
			.limit(20);
	}),
	topArtists: publicProcedure.query(async ({ ctx: { db } }) => {
		const rating = await db
			.select({
				total: count(ratings.rating),
				average: avg(ratings.rating),
				sortValue: RatingAlgorithm(0.8),
				artistId: ratings.parentId,
			})
			.from(ratings)
			.groupBy(ratings.parentId)
			.innerJoin(
				profile,
				and(
					eq(ratings.userId, profile.userId),
					eq(profile.deactivated, false),
				),
			)
			.where(
				and(
					eq(ratings.category, "ALBUM"),
					eq(ratings.deactivated, false),
				),
			)
			.orderBy(({ sortValue }) => desc(sortValue))
			.having(({ total }) => gt(total, 5))
			.limit(20);
		return rating;
	}),
	feed: publicProcedure
		.input(
			PaginatedInput.extend({
				filters: FeedFiltersSchema.optional(),
			}),
		)
		.query(
			async ({
				ctx: { db, userId, ph },
				input: { limit = 20, cursor = 0, filters },
			}) => {
				if (userId) {
					posthog(ph, [
						[
							"feed",
							{ distinctId: userId, properties: filters ?? {} },
						],
					]);
				}
				let followingWhere: any = undefined;
				if (filters?.following && userId) {
					followingWhere = await getFollowingWhere(db, userId);

					if (!followingWhere)
						return {
							items: [],
							nextCursor: undefined,
						};
				}

				let ratingTypeFilter: any;
				if (filters?.ratingType === "REVIEW") {
					ratingTypeFilter = isNotNull(ratings.content);
				} else if (filters?.ratingType === "RATING")
					ratingTypeFilter = isNull(ratings.content);

				const result = await db
					.select({
						ratings: ratings,
						profile: profile,
						sortValue: sql`${db.$count(
							likes,
							and(
								eq(likes.authorId, ratings.userId),
								eq(likes.resourceId, ratings.resourceId),
								eq(ratings.deactivated, false),
							),
						)} + ${db.$count(
							comments,
							and(
								eq(comments.authorId, ratings.userId),
								eq(comments.resourceId, ratings.resourceId),
								eq(comments.deactivated, false),
							),
						)} + EXTRACT(EPOCH FROM ${ratings.createdAt}) / 500000`,
					})
					.from(ratings)
					.innerJoin(
						profile,
						and(
							eq(ratings.userId, profile.userId),
							eq(profile.deactivated, false),
						),
					)
					.where(
						and(
							followingWhere,
							filters?.profileId
								? eq(ratings.userId, filters.profileId)
								: undefined,
							filters?.resourceId
								? eq(ratings.resourceId, filters.resourceId)
								: undefined,
							filters?.category
								? eq(ratings.category, filters.category)
								: undefined,
							filters?.rating
								? eq(ratings.rating, filters.rating)
								: undefined,
							ratingTypeFilter,
							eq(ratings.deactivated, false),
						),
					)
					.groupBy((t) => [
						t.ratings.userId,
						t.ratings.resourceId,
						t.profile.userId,
					])
					.limit(limit + 1)
					.offset(cursor)
					.orderBy((t) => [
						filters?.trending
							? desc(t.sortValue)
							: desc(t.ratings.createdAt),
					]);
				const items = result.map((item) => ({
					...item.ratings,
					profile: item.profile,
				}));
				let nextCursor: typeof cursor | undefined = undefined;
				if (items.length > limit) {
					items.pop();
					nextCursor = cursor + items.length;
				}
				return { items, nextCursor };
			},
		),
	distribution: publicProcedure
		.input(
			z.object({
				resourceId: ResourceSchema.shape.resourceId,
				filters: z
					.object({
						reviewType: z.enum(["REVIEW", "RATING"]).optional(),
						following: z.boolean().optional(),
					})
					.optional(),
			}),
		)
		.query(
			async ({ ctx: { db, userId }, input: { resourceId, filters } }) => {
				let followingWhere = undefined;
				if (filters?.following && userId) {
					followingWhere = await getFollowingWhere(db, userId);

					if (!followingWhere) return Array(10).fill(0);
				}

				const distributionRatings = await db
					.select({
						rating: ratings.rating,
						rating_count: count(ratings.rating),
					})
					.from(ratings)
					.innerJoin(
						profile,
						and(
							eq(ratings.userId, profile.userId),
							eq(profile.deactivated, false),
						),
					)
					.where(
						and(
							eq(ratings.resourceId, resourceId),
							filters?.reviewType
								? filters?.reviewType === "REVIEW"
									? isNotNull(ratings.content)
									: isNull(ratings.content)
								: undefined,
							followingWhere,
							eq(ratings.deactivated, false),
						),
					)
					.groupBy(ratings.rating)
					.orderBy(ratings.rating);

				const outputList: number[] = distributionRatings.reduce(
					(result, { rating, rating_count }) => {
						result[rating - 1] = rating_count;
						return result;
					},
					Array(10).fill(0),
				);

				return outputList;
			},
		),
	user: router({
		get: publicProcedure
			.input(z.object({ resourceId: z.string(), userId: z.string() }))
			.query(async ({ ctx: { db }, input: { resourceId, userId } }) => {
				const userRating = await db.query.ratings.findFirst({
					where: and(
						eq(ratings.resourceId, resourceId),
						eq(ratings.userId, userId),
						eq(ratings.deactivated, false),
					),
				});
				return userRating ? userRating : null;
			}),
		total: publicProcedure
			.input(z.object({ userId: z.string() }))
			.query(async ({ input: { userId }, ctx: { db } }) => {
				const total = await db.query.ratings.findMany({
					where: and(
						eq(ratings.userId, userId),
						eq(ratings.deactivated, false),
					),
				});
				return total.length;
			}),

		getList: protectedProcedure
			.input(
				z.object({
					resourceIds: z.string().array(),
					category: z.enum(["ALBUM", "SONG", "ARTIST"]),
				}),
			)
			.query(
				async ({
					ctx: { db, userId },
					input: { resourceIds, category },
				}) => {
					return await db.query.ratings.findMany({
						where: and(
							inArray(ratings.resourceId, resourceIds),
							eq(ratings.userId, userId),
							eq(ratings.category, category),
							eq(ratings.deactivated, false),
						),
					});
				},
			),
	}),
	rate: protectedProcedure
		.input(RateFormSchema)
		.mutation(async ({ ctx: { db, userId, ph }, input }) => {
			const { rating, resourceId, parentId, category, content } = input;
			if (rating === null) {
				await db
					.delete(ratings)
					.where(
						and(
							eq(ratings.userId, userId),
							eq(ratings.resourceId, resourceId),
							eq(ratings.category, category),
						),
					);
			} else {
				await db
					.insert(ratings)
					.values({
						rating,
						resourceId,
						category,
						userId,
						parentId,
						content,
					})
					.onConflictDoUpdate({
						target: [ratings.resourceId, ratings.userId],
						set: {
							rating,
							resourceId,
							category,
							userId,
							parentId,
							content,
							deactivated: false,
						},
					});
			}
			await posthog(ph, [
				[
					"rate",
					{
						distinctId: userId,
						properties: input,
					},
				],
			]);
		}),
	review: protectedProcedure
		.input(ReviewFormSchema)
		.mutation(async ({ ctx: { db, userId, ph }, input }) => {
			await db
				.insert(ratings)
				.values({ ...input, userId })
				.onConflictDoUpdate({
					target: [ratings.resourceId, ratings.userId],
					set: { ...input, userId },
				});
			await posthog(ph, [
				[
					"review",
					{
						distinctId: userId,
						properties: input,
					},
				],
			]);
		}),
	deactivate: moderatorProcedure
		.input(DeactivateRatingSchema)
		.mutation(async ({ ctx: { db }, input: { resourceId, userId } }) => {
			await db
				.update(ratings)
				.set({
					deactivated: true,
				})
				.where(
					and(
						eq(ratings.resourceId, resourceId),
						eq(ratings.userId, userId),
					),
				);
		}),
	leaderboard: publicProcedure.query(async ({ ctx: { db } }) => {
		return await db
			.select({
				total: count(ratings.rating),
				profile,
			})
			.from(ratings)
			.leftJoin(profile, eq(ratings.userId, profile.userId))
			.where(eq(ratings.deactivated, false))
			.groupBy(profile.userId)
			.orderBy(({ total }) => desc(total))
			.limit(20);
	}),
});

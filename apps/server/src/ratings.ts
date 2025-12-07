import { getDB, ratings } from "@recordscratch/db";
import {
	RateFormSchema,
	RatingSchema,
	ResourceSchema,
	type ServerEnv,
} from "@recordscratch/types";
import { Hono } from "hono";
import { getAuth } from "./lib/auth";
import { and, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { getPostHog, posthog } from "@recordscratch/api/src/posthog";

export const ratingsHandler = new Hono<{ Bindings: ServerEnv }>()
	.get("/", async (c) => {
		const { user } = await getAuth(c);
		const db = getDB(c.env.DATABASE_URL);

		const ratingList = await db.query.ratings.findMany({
			where: eq(ratings.userId, user.id),
		});

		return c.json(ratingList);
	})
	.post(
		"/",
		zValidator(
			"json",
			RateFormSchema.extend({
				rating: RatingSchema.shape.rating,
			}),
		),
		async (c) => {
			const { user } = await getAuth(c);
			const ph = getPostHog(c);
			const db = getDB(c.env.DATABASE_URL);

			const input = c.req.valid("json");
			const { rating, resourceId, parentId, category, content } = input;

			await db
				.insert(ratings)
				.values({
					rating,
					resourceId,
					category,
					userId: user.id,
					parentId,
					content,
				})
				.onConflictDoUpdate({
					target: [ratings.resourceId, ratings.userId],
					set: {
						rating,
						resourceId,
						category,
						userId: user.id,
						parentId,
						content,
						deactivated: false,
					},
				});

			await posthog(ph, [
				[
					"rate",
					{
						distinctId: user.id,
						properties: input,
					},
				],
			]);
		},
	)
	.delete("/", zValidator("json", ResourceSchema), async (c) => {
		const { user } = await getAuth(c);
		const db = getDB(c.env.DATABASE_URL);

		const input = c.req.valid("json");
		const { resourceId, category } = input;

		await db
			.delete(ratings)
			.where(
				and(
					eq(ratings.userId, user.id),
					eq(ratings.resourceId, resourceId),
					eq(ratings.category, category),
				),
			);
	});

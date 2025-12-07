import { getDB, ratings } from "@recordscratch/db";
import { type ServerEnv } from "@recordscratch/types";
import { Hono } from "hono";
import { avg, count } from "drizzle-orm";

export const resourceRatingsHandler = new Hono<{ Bindings: ServerEnv }>().get(
	"/",
	async (c) => {
		const db = getDB(c.env.DATABASE_URL);

		const resourceRatings = await db
			.select({
				average: avg(ratings.rating),
				total: count(ratings.rating),
				resourceId: ratings.resourceId,
			})
			.from(ratings)
			.groupBy(ratings.resourceId);

		console.log(resourceRatings.length);

		return c.json(resourceRatings);
	},
);

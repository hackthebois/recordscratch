import { ratings, type DB } from "@/server/db";
import type { Resource } from "@/types";
import { and, count, eq, isNotNull } from "drizzle-orm";

type MetaInput = {
	db: DB;
	resourceId: Resource["resourceId"];
	category: Resource["category"];
	onlyReviews?: boolean;
};

export const getTotalRatings = async ({
	db,
	resourceId,
	category,
	onlyReviews,
}: MetaInput) => {
	return await db
		.select({ total: count(ratings.rating) })
		.from(ratings)
		.where(
			and(
				eq(ratings.resourceId, resourceId),
				eq(ratings.category, category),
				eq(ratings.deactivated, false),
				onlyReviews ? isNotNull(ratings.content) : undefined,
			),
		)
		.then(([result]) => result.total);
};

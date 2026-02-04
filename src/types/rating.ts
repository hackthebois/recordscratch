import { ratings } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { Profile } from "./profile";

export const ResourceRatingSchema = z.object({
	resourceId: z.string(),
	average: z.string().nullable(),
	total: z.number(),
});
export type ResourceRating = z.infer<typeof ResourceRatingSchema>;

export const RatingSchema = createSelectSchema(ratings, {
	rating: z.number().min(1).max(10),
	content: z.string().min(1).max(10000).nullable(),
});
export type Rating = z.infer<typeof RatingSchema>;

export const ResourceSchema = RatingSchema.pick({
	parentId: true,
	resourceId: true,
	category: true,
});
export type Resource = z.infer<typeof ResourceSchema>;

export const RateFormSchema = RatingSchema.pick({
	parentId: true,
	resourceId: true,
	category: true,
	rating: true,
	content: true,
}).extend({
	rating: RatingSchema.shape.rating.nullable(),
	content: RatingSchema.shape.content.nullish(),
});
export type RateForm = z.infer<typeof RateFormSchema>;

export const ReviewFormSchema = RatingSchema.pick({
	parentId: true,
	resourceId: true,
	category: true,
	content: true,
	rating: true,
});
export type ReviewForm = z.infer<typeof ReviewFormSchema>;

export const CategorySchema = RatingSchema.pick({
	category: true,
});
export type CategoryType = z.infer<typeof CategorySchema>;

export type ReviewType = Rating & {
	profile: Profile;
};

export const FeedFiltersSchema = z.object({
	profileId: z.string().optional(),
	resourceId: ResourceSchema.shape.resourceId.optional(),
	category: ResourceSchema.shape.category.optional(),
	rating: z.number().optional(),
	trending: z.boolean().optional(),
	following: z.boolean().optional(),
	ratingType: z.enum(["REVIEW", "RATING"]).optional(),
});
export type FeedFilters = z.infer<typeof FeedFiltersSchema>;

export const DeactivateRatingSchema = RatingSchema.pick({
	userId: true,
	resourceId: true,
});
export type DeactivateForm = z.infer<typeof DeactivateRatingSchema>;

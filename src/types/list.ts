import { listResources, lists } from "@/server/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ProfileSchema, type Profile } from "./profile";

export const listSchema = createInsertSchema(lists, {
	name: z.string().max(50).min(1).trim(),
});

export const insertListSchema = listSchema
	.pick({
		name: true,
		description: true,
		category: true,
	})
	.extend({
		onProfile: listSchema.shape.onProfile.optional(),
	});
export type InsertList = z.infer<typeof insertListSchema>;

export const updateListSchema = listSchema.pick({
	id: true,
	name: true,
	description: true,
	onProfile: true,
});
export const updateFormSchema = listSchema.pick({
	name: true,
	description: true,
	onProfile: true,
});
export type UpdateList = z.infer<typeof updateFormSchema>;

export const selectListSchema = listSchema.pick({
	id: true,
});

export const filterUserListsSchema = listSchema
	.pick({
		userId: true,
	})
	.extend({
		category: listSchema.shape.category.optional(),
	});

export const listResourcesSchema = createInsertSchema(listResources, {
	parentId: z.string().optional(),
});

export type ListResourceType = z.infer<typeof listResourcesSchema>;

export type ListItem = Pick<
	ListResourceType,
	"parentId" | "listId" | "resourceId" | "position"
> & {
	rating: number | null;
};

export type UserListItem = ListResourceType;

export const getUserSchema = z.object({
	lists: listSchema,
	list_resources: z.array(listResourcesSchema),
	profile: ProfileSchema,
});

export const insertListResourcesSchema = listResourcesSchema.pick({
	parentId: true,
	listId: true,
	resourceId: true,
});

export const selectListResourcesSchema = z.object({
	...listResourcesSchema.pick({
		listId: true,
	}).shape,
	...ProfileSchema.pick({ userId: true }).shape,
});

export const listOfResourcesSchema = z.object({
	listId: z.string(),
	resources: z.array(
		z.object({
			...listResourcesSchema.pick({
				listId: true,
				resourceId: true,
				position: true,
				parentId: true,
			}).shape,
			rating: z.number().nullable(),
		}),
	),
});

export const deleteListResourcesSchema = listResourcesSchema.pick({
	listId: true,
	resourceId: true,
});

export type ListType = z.infer<typeof listSchema> & {
	profile: Profile | null;
};

export type ListsType = ListType & {
	profile: Profile | null;
	resources: UserListItem[];
};

export type ListWithResources = z.infer<typeof listSchema> & {
	resources: UserListItem[];
};
const categorySchema = listSchema.pick({ category: true });
export type Category = z.infer<typeof categorySchema>["category"];

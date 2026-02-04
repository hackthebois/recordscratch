import { comments } from "@/server/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { Profile } from "./profile";

export const CommentSchema = createSelectSchema(comments);
export type Comment = z.infer<typeof CommentSchema>;

export const SelectCommentSchema = CommentSchema.pick({
	resourceId: true,
	authorId: true,
});
export type SelectComment = z.infer<typeof SelectCommentSchema>;

export const CreateCommentSchema = createInsertSchema(comments, {
	content: z.string().min(1).max(10000),
})
	.omit({
		userId: true,
	})
	.extend({
		parentId: z.string().nullable(),
		rootId: z.string().nullable(),
	});
export type CreateComment = z.infer<typeof CreateCommentSchema>;

export const DeleteCommentSchema = CommentSchema.pick({
	id: true,
});

export const SelectRepliesSchema = CreateCommentSchema.pick({
	authorId: true,
	resourceId: true,
	parentId: true,
});
export type SelectReplies = z.infer<typeof SelectRepliesSchema>;

export type CommentAndProfile = Comment & { profile: Profile };

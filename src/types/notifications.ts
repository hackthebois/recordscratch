import { commentNotifications, followNotifications, likeNotifications } from "@/server/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**** Comment Notification Types ****/
export const CommentNotificationSchema = createSelectSchema(commentNotifications);
export type CommentNotification = z.infer<typeof CommentNotificationSchema>;
export const CreateCommentNotificationSchema = createInsertSchema(commentNotifications);
export type CreateCommentNotification = z.infer<typeof CreateCommentNotificationSchema>;

/**** Follow Notification Types ****/
export const FollowNotificationSchema = createSelectSchema(followNotifications);
export type FollowNotification = z.infer<typeof FollowNotificationSchema>;
export const CreateFollowNotificationSchema = createInsertSchema(followNotifications);
export type CreateFollowNotification = z.infer<typeof CreateFollowNotificationSchema>;

/**** Like Notification Types ****/
export const LikeNotificationSchema = createSelectSchema(likeNotifications);
export type LikeNotification = z.infer<typeof LikeNotificationSchema>;
export const CreateLikeNotificationSchema = createInsertSchema(likeNotifications);
export type CreateLikeNotification = z.infer<typeof CreateLikeNotificationSchema>;

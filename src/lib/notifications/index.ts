import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
	CreateCommentNotificationSchema,
	CreateFollowNotificationSchema,
	CreateLikeNotificationSchema,
	type Comment,
	type CreateCommentNotification,
	type CreateFollowNotification,
	type CreateLikeNotification,
	type Profile,
	type Rating,
} from "@/types";
import { z } from "zod";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export const registerForPushNotificationsAsync = async () => {
	let token;

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			console.log("Failed to get push token for push notification!");
			return;
		}
		// Learn more about projectId:
		// https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
		// EAS projectId is used here.
		try {
			const projectId =
				Constants?.expoConfig?.extra?.eas?.projectId ??
				Constants?.easConfig?.projectId;
			if (!projectId) {
				throw new Error("Project ID not found");
			}
			token = (
				await Notifications.getExpoPushTokenAsync({
					projectId,
				})
			).data;
		} catch (e) {
			token = `${e}`;
		}
	} else {
		console.log("Must use physical device for Push Notifications");
	}

	return token;
};

export const NotificationDataSchema = z
	.object({
		data: CreateFollowNotificationSchema,
		type: z.literal("FOLLOW"),
	})
	.or(
		z.object({
			data: CreateCommentNotificationSchema.extend({
				id: z.string(),
			}),
			type: z.literal("COMMENT"),
		}),
	)
	.or(
		z.object({
			data: CreateLikeNotificationSchema,
			type: z.literal("LIKE"),
		}),
	);
export type NotificationData = z.infer<typeof NotificationDataSchema>;

export type Notification = {
	title: string;
	action: string;
	body: string;
	profile: Profile;
	content: string | undefined;
	data: {
		url: string;
		notification: NotificationData;
	};
};

export const parseCommentNotification = ({
	profile,
	comment,
	handle,
	notification,
}: {
	profile: Profile;
	comment: Comment;
	handle: string;
	notification: CreateCommentNotification & { id: string };
}): Notification => {
	const type = comment.parentId ? "REPLY" : "COMMENT";
	const action = type === "REPLY" ? "replied" : "commented";
	return {
		title: `New ${type === "REPLY" ? "Reply" : "Comment"}!`,
		profile,
		action,
		body: `${profile.name} ${action}: ${comment.content}`,
		content: comment.content,
		data: {
			url: `/${handle}/ratings/${comment.resourceId}`,
			notification: { data: notification, type: "COMMENT" },
		},
	};
};

export const parseFollowNotification = ({
	profile,
	notification,
}: {
	profile: Profile;
	notification: CreateFollowNotification;
}): Notification => {
	return {
		title: "New Follower!",
		action: "followed you",
		body: `${profile.name} followed you`,
		content: undefined,
		profile,
		data: {
			url: `/${profile.handle}`,
			notification: { data: notification, type: "FOLLOW" },
		},
	};
};

export const parseLikeNotification = ({
	profile,
	rating,
	handle,
	notification,
}: {
	profile: Profile;
	rating: Rating;
	handle: string;
	notification: CreateLikeNotification;
}): Notification => {
	const action = rating.content ? "liked your review" : "liked your rating";
	return {
		title: "New Like!",
		action,
		body: `${profile.name} ${action}${rating.content ? `: ${rating.content}` : ""}`,
		content: rating.content ?? undefined,
		profile,
		data: {
			url: `/${handle}/ratings/${rating.resourceId}`,
			notification: { data: notification, type: "LIKE" },
		},
	};
};

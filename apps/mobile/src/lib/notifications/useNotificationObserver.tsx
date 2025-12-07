import { NotificationData } from "@recordscratch/lib";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { api } from "../api";
import { Platform } from "react-native";

export function useNotificationObserver() {
	const router = useRouter();
	const utils = api.useUtils();
	const markSeen = api.notifications.markSeen.useMutation({
		onSuccess: () => {
			utils.notifications.get.invalidate();
			utils.notifications.getUnseen.invalidate();
		},
	});

	useEffect(() => {
		if (Platform.OS === "web") return;
		let isMounted = true;

		async function redirect(notification: Notifications.Notification) {
			const url = notification.request.content.data?.url;
			const data = notification.request.content.data?.notification as
				| NotificationData
				| undefined;

			if (data) {
				markSeen.mutate(data);
				if (data.type === "COMMENT") {
					utils.comments.get.invalidate({
						id: data.data.commentId,
					});
				}
			}

			router.navigate("/(tabs)/(notifications)");
			if (url) {
				router.navigate(`/(tabs)/(notifications)${url}`);
			}
		}

		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (!isMounted || !response?.notification) {
				return;
			}
			redirect(response?.notification);
		});

		const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
			redirect(response.notification);
		});

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, []);
}

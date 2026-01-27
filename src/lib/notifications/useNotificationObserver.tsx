import { NotificationData } from "@/lib";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { api } from "../api";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

export function useNotificationObserver() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const markSeen = useMutation(
		api.notifications.markSeen.mutationOptions({
			onSuccess: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.notifications.get.queryOptions(),
					),
					queryClient.invalidateQueries(
						api.notifications.getUnseen.queryOptions(),
					),
				]),
		}),
	);

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
					queryClient.invalidateQueries(
						api.comments.get.queryOptions({
							id: data.data.commentId,
						}),
					);
				}
			}

			if (url) {
				router.navigate(`/(tabs)/(notifications)${url}`);
			}
		}

		const lastResponse = Notifications.getLastNotificationResponse();
		if (isMounted && lastResponse?.notification) {
			redirect(lastResponse.notification);
		}

		const subscription =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					redirect(response.notification);
				},
			);

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, []);
}

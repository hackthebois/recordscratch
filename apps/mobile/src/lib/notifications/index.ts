import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
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
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
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
				Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
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

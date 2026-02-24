import * as Sentry from "@sentry/react-native";
import env from "../env";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const catchError = async (error: any) => {
	console.log(error, env.ENV);
	if (env.ENV !== "development") Sentry.captureException(error);
	if (Platform.OS !== "web") {
		await SecureStore.deleteItemAsync("sessionId");
	}
};

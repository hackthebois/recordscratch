import * as Updates from "expo-updates";
import { Platform } from "react-native";

let env = {
	ENV: "development",
	R2_PUBLIC_URL: "https://cdn.recordscratch.app",
	SCHEME:
		Platform.OS === "web" ? "http://localhost:3000/" : "recordscratch://",
	SITE_URL: "http://localhost:3000",
	DEBUG: true,
};

if (Platform.OS === "android") {
	env.SITE_URL = "https://recordscratch.app";
}

if (Platform.OS === "web") {
	env.ENV = "production";
	env.SCHEME = process.env.EXPO_PUBLIC_SITE_URL!;
	env.SITE_URL = process.env.EXPO_PUBLIC_SITE_URL!;
	env.DEBUG = false;
}

if (Updates.channel === "production") {
	env.ENV = "production";
	env.SITE_URL = "https://recordscratch.app";
	env.DEBUG = false;
} else if (Updates.channel === "staging") {
	env.ENV = "staging";
	env.SITE_URL = "https://dev.recordscratch.app"; // No staging site yet
}

export default env;

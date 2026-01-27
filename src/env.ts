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
	env.SITE_URL = "https://api.recordscratch.app";
}

if (Platform.OS === "web" && process.env.NODE_ENV !== "development") {
	env.ENV = "production";
	env.SCHEME = "https://recordscratch.app";
	env.SITE_URL = "https://api.recordscratch.app";
	env.DEBUG = false;
}

if (Updates.channel === "production") {
	env.ENV = "production";
	env.SITE_URL = "https://api.recordscratch.app";
	env.DEBUG = false;
} else if (Updates.channel === "staging") {
	env.ENV = "staging";
	env.SITE_URL = "https://dev-api.recordscratch.app"; // No staging site yet
}

export default env;

import { Platform } from "react-native";

if (!process.env.EXPO_PUBLIC_SITE_URL)
	throw new Error("EXPO_PUBLIC_SITE_URL not set");

let env = {
	ENV: process.env.NODE_ENV,
	R2_PUBLIC_URL: "https://cdn.recordscratch.app",
	SCHEME:
		Platform.OS === "web"
			? process.env.EXPO_PUBLIC_SITE_URL
			: "recordscratch://",
	SITE_URL: process.env.EXPO_PUBLIC_SITE_URL || "https://recordscratch.app",
};

export default env;

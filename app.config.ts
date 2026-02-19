import type { ConfigContext, ExpoConfig } from "@expo/config";

const version = "0.1.3";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "RecordScratch",
	slug: "recordscratch",
	version,
	orientation: "portrait",
	icon: "./assets/icon.png",
	scheme: "recordscratch",
	userInterfaceStyle: "automatic",
	assetBundlePatterns: ["**/*"],
	ios: {
		supportsTablet: true,
		bundleIdentifier: "app.recordscratch.ios",
		usesAppleSignIn: true,
		entitlements: {
			"com.apple.developer.applesignin": ["Default"],
		},
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
		},
	},
	newArchEnabled: true,
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#ffffff",
		},
		package: "app.recordscratch.android",
		versionCode: 1,
		googleServicesFile:
			process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
	},
	web: {
		favicon: "./assets/icon.png",
		bundler: "metro",
		output: "server",
	},
	plugins: [
		"expo-router",
		[
			"@sentry/react-native/expo",
			{
				url: "https://sentry.io/",
				project: "recordscratch",
				organization: "recordscratch",
			},
		],
		[
			"expo-splash-screen",
			{
				image: "./assets/icon.png",
				imageWidth: 200,
				resizeMode: "contain",
				backgroundColor: "#ffffff",
			},
		],
		"expo-web-browser",
		"expo-apple-authentication",
		"expo-font",
		"expo-secure-store",
	],
	experiments: {
		typedRoutes: true,
	},
	jsEngine: "hermes",
	platforms: ["ios", "android", "web"],
	extra: {
		eas: {
			projectId: "7cef8d5a-7c74-45d8-909d-5202b9c533e3",
		},
	},
	owner: "recordscratch",
	updates: {
		url: "https://u.expo.dev/7cef8d5a-7c74-45d8-909d-5202b9c533e3",
	},
	runtimeVersion: version,
});

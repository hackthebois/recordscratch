import env from "@/env";
import {
	AuthProvider,
	QueryProvider,
	ThemeProvider,
} from "@/components/Providers";
import { PrefetchProfile } from "@/components/Prefetch";
import { catchError } from "@/lib/errors";
import {
	Montserrat_100Thin,
	Montserrat_200ExtraLight,
	Montserrat_300Light,
	Montserrat_400Regular,
	Montserrat_500Medium,
	Montserrat_600SemiBold,
	Montserrat_700Bold,
	Montserrat_800ExtraBold,
	Montserrat_900Black,
	useFonts,
} from "@expo-google-fonts/montserrat";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { SplashScreen, Stack, useNavigationContainerRef } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
import { defaultScreenOptions } from "@/lib/navigation";
import { Text, View } from "react-native";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

const timeoutPromise = new Promise<void>((_, reject) => {
	setTimeout(() => {
		reject(new Error("Timeout error"));
	}, 5000);
}).catch(() => {});

// Construct a new integration instance. This is needed to communicate between the integration and React
const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
	dsn: "https://2648bda3885c4f3b7ab58671e8a9d44f@o4508287201312768.ingest.us.sentry.io/4508287205441536",
	sendDefaultPii: true,
	enableLogs: true,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	const [fontLoaded, fontError] = useFonts({
		Montserrat_100Thin,
		Montserrat_200ExtraLight,
		Montserrat_300Light,
		Montserrat_400Regular,
		Montserrat_500Medium,
		Montserrat_600SemiBold,
		Montserrat_700Bold,
		Montserrat_800ExtraBold,
		Montserrat_900Black,
	});
	const ref = useNavigationContainerRef();
	const [updatesHandled, setUpdatesHandled] = useState(false);

	// This is the default configuration
	configureReanimatedLogger({
		level: ReanimatedLogLevel.error,
		strict: false, // Reanimated runs in strict mode by default
	});

	useEffect(() => {
		const preload = async () => {
			if (env.ENV !== "development") {
				try {
					const update = await Promise.race([
						Updates.checkForUpdateAsync(),
						timeoutPromise,
					]);
					if (update && update.isAvailable) {
						await Updates.fetchUpdateAsync();
						await Updates.reloadAsync();
					}
				} catch (error) {
					catchError(error);
				}
			}
		};
		preload().finally(() => setUpdatesHandled(true));
	}, []);

	useEffect(() => {
		if (ref?.current) {
			navigationIntegration.registerNavigationContainer(ref);
		}
	}, [ref]);

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (fontError) throw fontError;
	}, [fontError]);

	if (!fontLoaded || !updatesHandled) {
		return null;
	}

	return (
		<AuthProvider>
			<QueryProvider>
				<SafeAreaProvider>
					<ThemeProvider>
						<PrefetchProfile />
						<Stack screenOptions={defaultScreenOptions}>
							<Stack.Screen
								name="index"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="(tabs)"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="(auth)/signin"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="(auth)/onboard"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="(auth)/deactivated"
								options={{
									headerShown: false,
								}}
							/>
							<Stack.Screen
								name="(modals)/rating"
								options={{
									title: "",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/list/searchResource"
								options={{
									title: "SEARCH",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/list/rearrangeList"
								options={{
									title: "Rearrange the List",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/list/create"
								options={{
									title: "Create List",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/list/addToList"
								options={{
									title: "Add it to a List",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/reply/rating"
								options={{
									title: "",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
							<Stack.Screen
								name="(modals)/reply/comment"
								options={{
									title: "",
									presentation: "modal",
									animation: "slide_from_bottom",
								}}
							/>
						</Stack>
						<PortalHost />
					</ThemeProvider>
				</SafeAreaProvider>
			</QueryProvider>
		</AuthProvider>
	);
};

export default Sentry.wrap(RootLayout);

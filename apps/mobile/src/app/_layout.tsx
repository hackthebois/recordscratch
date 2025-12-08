import env from "@/env";
import { AuthProvider, QueryProvider } from "@/components/Providers";
import { PrefetchProfile } from "@/components/Prefetch";
import { NAV_THEME } from "@/lib/constants";
import { catchError } from "@/lib/errors";
import { useColorScheme } from "@/lib/useColorScheme";
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
import { DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { SplashScreen, Stack, useNavigationContainerRef } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultScreenOptions } from "@/lib/navigation";
import { api, queryClient } from "@/lib/api";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	dark: false,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DefaultTheme,
	dark: true,
	colors: NAV_THEME.dark,
};

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "auth",
};

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
	const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
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

	useEffect(() => {
		(async () => {
			const theme = await AsyncStorage.getItem("theme");
			console.log("base", theme);
			if (!theme) {
				setColorScheme(colorScheme);
				setIsColorSchemeLoaded(true);
				return;
			}

			const colorTheme = theme === "dark" ? "dark" : "light";
			setColorScheme(colorTheme);
			setIsColorSchemeLoaded(true);
		})();
	}, []);

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (fontError) throw fontError;
	}, [fontError]);

	if (!fontLoaded || !isColorSchemeLoaded || !updatesHandled) {
		return null;
	}

	return (
		<AuthProvider>
			<QueryProvider>
				<SafeAreaProvider>
					<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
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

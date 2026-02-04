import {
	Appearance,
	Platform,
	useColorScheme as useRNColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ColorScheme = "light" | "dark";

interface UseColorSchemeResult {
	colorScheme: ColorScheme;
	isDarkColorScheme: boolean;
	utilsColor: "white" | "black";
	setColorScheme: (scheme: ColorScheme | "system") => void;
	toggleColorScheme: () => void;
}

export function useColorScheme(): UseColorSchemeResult {
	const colorScheme = useRNColorScheme();
	const adjustedColorScheme: ColorScheme = colorScheme ?? "light";

	const setColorScheme = async (
		scheme: Parameters<(value: "light" | "dark" | "system") => void>[0],
	) => {
		if (Platform.OS !== "web") {
			Appearance.setColorScheme(scheme === "system" ? null : scheme);
		}
		await AsyncStorage.setItem("theme", scheme);
	};

	const toggleColorScheme = async () => {
		const scheme = adjustedColorScheme === "light" ? "dark" : "light";
		await setColorScheme(scheme);
	};

	return {
		colorScheme: adjustedColorScheme,
		isDarkColorScheme: adjustedColorScheme === "dark",
		utilsColor: adjustedColorScheme === "dark" ? "white" : "black",
		setColorScheme,
		toggleColorScheme,
	};
}

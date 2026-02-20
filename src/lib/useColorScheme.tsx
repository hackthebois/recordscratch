import {
	Appearance,
	ColorSchemeName,
	Platform,
	useColorScheme as useRNColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UseColorSchemeResult {
	colorScheme: ColorSchemeName;
	isDarkColorScheme: boolean;
	utilsColor: "white" | "black";
	setColorScheme: (scheme: ColorSchemeName) => void;
	toggleColorScheme: () => void;
}

export function useColorScheme(): UseColorSchemeResult {
	const colorScheme = useRNColorScheme();
	const adjustedColorScheme: ColorSchemeName = colorScheme ?? "light";

	const setColorScheme = async (
		scheme: Parameters<(value: ColorSchemeName) => void>[0],
	) => {
		if (Platform.OS !== "web") {
			Appearance.setColorScheme(scheme);
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

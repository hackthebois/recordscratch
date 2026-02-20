import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { StackScreenProps } from "expo-router";
import { Platform } from "react-native";

const HeaderTitle = (props: any) => {
	if (Platform.OS === "web") return null;
	return <Text variant="h4">{props.children}</Text>;
};

const labelStyle = {
	fontFamily: "Montserrat_500Medium",
	fontSize: 14,
};

export const backButton = {
	type: "button" as const,
	label: "Back",
	onPress: () => router.back(),
	labelStyle,
};

export const headerRight = (headerRight: {
	type: "button" | "menu" | "spacing" | "custom";
	label: string;
	onPress: () => void;
	enabled?: boolean;
}): StackScreenProps["options"] => {
	if (headerRight.enabled === false) return {};

	return {
		headerRight:
			Platform.OS !== "web"
				? () => (
						<Button onPress={headerRight.onPress}>
							{headerRight.label}
						</Button>
					)
				: undefined,
		unstable_headerRightItems: () => [
			{
				...headerRight,
				labelStyle,
			} as any,
		],
	};
};

export const sideSpacing = {};

export const defaultScreenOptions: StackScreenProps["options"] = {
	headerTitle: (props: any) => <HeaderTitle {...props} />,
	headerShadowVisible: false,
	animation: "fade",
	title: "",
	headerTitleAlign: "center",
	unstable_headerLeftItems: ({ canGoBack }) =>
		canGoBack ? [backButton] : [],
	headerBackVisible: false,
};

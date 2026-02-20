import { WebHeaderRight } from "@/components/WebHeaderRight";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { StackScreenProps } from "expo-router";
import { Platform } from "react-native";

const HeaderTitle = (props: any) => {
	if (Platform.OS === "web") return null;
	return <Text variant="h4">{props.children}</Text>;
};

export const backButton = {
	type: "button" as const,
	label: "Back",
	onPress: () => router.back(),
};

export const defaultScreenOptions: StackScreenProps["options"] = {
	headerTitle: (props: any) => <HeaderTitle {...props} />,
	headerShadowVisible: false,
	animation: "fade",
	title: "",
	headerTitleAlign: "center",
	unstable_headerLeftItems: ({ canGoBack }) =>
		canGoBack ? [backButton] : [],
	headerRight: Platform.OS === "web" ? () => <WebHeaderRight /> : undefined,
	headerBackVisible: false,
};

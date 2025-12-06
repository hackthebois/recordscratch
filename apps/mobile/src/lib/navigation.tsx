import { BackButton } from "@/components/BackButton";
import { WebHeaderRight } from "@/components/WebHeaderRight";
import { Text } from "@/components/ui/text";
import { ScreenProps } from "expo-router";
import { Platform } from "react-native";

const HeaderTitle = (props: any) => {
	if (Platform.OS === "web") return null;
	return <Text variant="h4">{props.children}</Text>;
};

export const defaultScreenOptions: ScreenProps["options"] = {
	headerTitle: (props: any) => <HeaderTitle {...props} />,
	headerShadowVisible: false,
	animation: "fade",
	title: "",
	headerTitleAlign: "center",
	headerRight: () => <WebHeaderRight />,
	headerLeft: ({ canGoBack }: any) => canGoBack && <BackButton />,
	headerBackVisible: false,
};

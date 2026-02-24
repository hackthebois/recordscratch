import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { WebHeaderRight } from "@/components/WebHeaderRight";
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

type HeaderRight = {
	type: "button" | "menu" | "spacing" | "custom";
	label: string;
	Icon?: React.ReactNode;
	onPress: () => void;
	enabled?: boolean;
};
export const useHeaderRight = ({
	Icon,
	...headerRight
}: HeaderRight): StackScreenProps["options"] &
	HeaderRight & { Button?: React.ReactNode } => {
	const HeaderButton = (
		<Button variant="secondary" onPress={headerRight.onPress}>
			{Icon ? Icon : null}
			<Text>{headerRight.label}</Text>
		</Button>
	);

	if (headerRight.enabled === false) return headerRight;

	if (Platform.OS === "web")
		return {
			...headerRight,
			Button: HeaderButton,
		};

	return {
		...headerRight,
		headerRight: () => (
			<Button
				onPress={headerRight.onPress}
				className="rounded-full"
				size="sm"
			>
				<Text>{headerRight.label}</Text>
			</Button>
		),
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
	headerBackVisible: Platform.OS !== "ios",
	headerRight: Platform.OS === "web" ? () => <WebHeaderRight /> : undefined,
};

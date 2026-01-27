import { ScreenProps, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

export const Page = ({
	title,
	options,
	children,
}: {
	title?: string;
	options?: ScreenProps["options"];
	children: React.ReactNode;
}) => {
	const backgroundColor = useCSSVariable("--color-background");

	return (
		<SafeAreaView
			edges={["left", "right"]}
			style={{
				flex: 1,
				backgroundColor: backgroundColor as string,
			}}
		>
			{title || options ? (
				<Stack.Screen
					options={{
						...options,
						title,
					}}
				/>
			) : null}
			{children}
		</SafeAreaView>
	);
};

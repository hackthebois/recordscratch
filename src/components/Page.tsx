import { ScreenProps, Stack } from "expo-router";
import { Edges, SafeAreaView } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

export const Page = ({
	title,
	options,
	children,
	edges = ["left", "right"],
}: {
	title?: string;
	options?: ScreenProps["options"];
	children: React.ReactNode;
	edges?: Edges;
}) => {
	const backgroundColor = useCSSVariable("--color-background");

	return (
		<SafeAreaView
			edges={edges}
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
						headerStyle: {
							backgroundColor: backgroundColor as string,
						},
					}}
				/>
			) : null}
			{children}
		</SafeAreaView>
	);
};

import { ScreenProps, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
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

	useEffect(() => {
		if (title && Platform.OS === "web" && typeof document !== "undefined") {
			document.title = title;
		}
	}, [title]);

	return (
		<SafeAreaView
			edges={edges}
			style={{
				flex: 1,
				backgroundColor: backgroundColor as string,
			}}
			collapsable={false}
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

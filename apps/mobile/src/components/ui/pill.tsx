import * as React from "react";

import { View } from "react-native";
import { Text } from "./text";
import { cn } from "@recordscratch/lib";

export const Pill = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<View
			className={cn(
				"rounded-full border border-border bg-background px-2.5 py-1",
				className
			)}>
			<Text className="font-medium text-sm">{children}</Text>
		</View>
	);
};

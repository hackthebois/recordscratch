import { Text } from "@/components/ui/text";
import { cn } from "@/lib";
import { View } from "react-native";
import { Skeleton } from "../ui/skeleton";

const StatBlock = ({
	title,
	description,
	size = "default",
	loading,
	className,
}: {
	title: string;
	description: string | number;
	size?: "sm" | "default";
	loading?: boolean;
	className?: string;
}) => {
	return (
		<View
			className={cn(
				"border-border gap-2 rounded-xl border",
				size === "sm" && "px-3 py-2",
				size === "default" && "px-4 py-3",
				className,
			)}
		>
			<Text
				className={cn("font-semibold", size === "default" && "text-lg")}
			>
				{title}
			</Text>
			{loading ? (
				<Skeleton>
					<Text className={cn(size === "default" && "text-lg")} />
				</Skeleton>
			) : (
				<Text className={cn(size === "default" && "text-lg")}>
					{description}
				</Text>
			)}
		</View>
	);
};

export default StatBlock;

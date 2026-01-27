import { Text } from "@/components/ui/text";
import { cn } from "@/lib";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
	Easing,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";

const AnimatedBar = ({
	status,
	height,
}: {
	status: "active" | "normal" | "inactive";
	height: number;
}) => {
	const heightAnim = useSharedValue(0);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		heightAnim.value = withDelay(
			isInitialLoad ? 400 : 0,
			withTiming(height, {
				duration: 400,
				easing: Easing.out(Easing.cubic),
			}),
		);
		if (isInitialLoad) setIsInitialLoad(false);
	}, [height]);

	return (
		<Animated.View
			style={{
				height: heightAnim,
				backgroundColor: status === "active" ? "#ff8c00" : "#ffb703",
				opacity: status === "inactive" ? 0.7 : 1.0,
			}}
			className="h-full min-h-0 w-full rounded-t"
		/>
	);
};

const DistributionChart = ({
	distribution = [],
	value,
	onChange,
	height = 112,
}: {
	distribution?: number[];
	value?: number;
	onChange: (rating?: number) => void;
	height?: number;
}) => {
	const maxRating =
		Math.max(...distribution) === 0 ? 1 : Math.max(...distribution);

	return (
		<View className="flex w-full flex-col items-center">
			<View
				className="flex w-full flex-row gap-1"
				style={{
					height,
				}}
			>
				{distribution?.map((ratings, index) => (
					<TouchableOpacity
						className="flex h-full flex-1 flex-col-reverse"
						key={index}
						onPress={() => {
							if (value === index + 1) onChange(undefined);
							else onChange(index + 1);
						}}
					>
						<AnimatedBar
							height={(ratings / maxRating) * height}
							status={
								value === index + 1
									? "active"
									: value && value !== index + 1
										? "inactive"
										: "normal"
							}
						/>
					</TouchableOpacity>
				))}
			</View>
			<View className="flex w-full flex-row gap-1 pt-2">
				{Array.from({
					length: 10,
				}).map((_, index) => (
					<View
						className="flex flex-1 flex-row items-center justify-center"
						key={index}
					>
						<Text
							className={cn(
								value === index + 1 && "text-[#ff8c00]",
							)}
						>
							{index + 1}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export default DistributionChart;

import { PressableProps, Pressable as RNPressable } from "react-native";
import Animated, {
	Easing,
	useSharedValue,
	withTiming,
	useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export const Pressable = (props: PressableProps) => {
	const opacity = useSharedValue(1);

	const handlePressIn = () => {
		opacity.value = withTiming(0.5, {
			duration: 500,
			easing: Easing.out(Easing.exp),
		});
	};

	const handlePressOut = () => {
		opacity.value = withTiming(1, {
			duration: 500,
			easing: Easing.out(Easing.exp),
		});
	};

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
		};
	});

	return (
		<AnimatedPressable
			{...props}
			className={props.className}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[props.style, animatedStyle]} // Combine animated and incoming styles
		>
			{props.children}
		</AnimatedPressable>
	);
};

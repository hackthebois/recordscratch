import { ArrowLeft } from "@/lib/icons/IconsLoader";
import { Link } from "expo-router";
import { Platform, useWindowDimensions } from "react-native";

export const BackButton = () => {
	const { width } = useWindowDimensions();

	return (
		<Link
			href={".."}
			style={{
				marginLeft: width > 1024 ? (width - 1024) / 2 : Platform.OS === "web" ? 0 : -16,
			}}
			className="flex h-full flex-row items-center justify-center px-4">
			<ArrowLeft size={28} className="text-primary" />
		</Link>
	);
};

import { cn } from "@/lib";
import { View } from "react-native";
import { ResourceItem } from "./ResourceItem";

const AlbumItem = ({
	resourceId,
	className,
}: {
	resourceId: string;
	className?: string;
}) => {
	return (
		<View className={className}>
			<ResourceItem
				direction="vertical"
				resource={{
					resourceId: resourceId,
					category: "ALBUM",
					parentId: "",
				}}
				textClassName="w-40"
				artistClassName="w-40 line-clamp-1"
			/>
		</View>
	);
};

export default AlbumItem;

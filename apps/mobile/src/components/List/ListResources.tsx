import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import { Category, ListItem } from "@recordscratch/types";
import { View } from "react-native";
import { Text } from "../ui/text";
import { cn } from "@recordscratch/lib";

const ListResources = ({ items, category }: { items: ListItem[]; category: Category }) => {
	return (
		<View className="flex h-full w-full flex-col">
			{items.map((item, index) => (
				<View
					key={index}
					className={cn(
						"flex flex-row items-center gap-3 rounded-xl border-b border-muted"
					)}>
					<Text
						style={{ fontSize: 12, marginLeft: 15 }}
						className="w-6 font-bold text-muted-foreground">
						{index + 1}
					</Text>
					{category === "ARTIST" ? (
						<ArtistItem
							artistId={item.resourceId}
							imageWidthAndHeight={60}
							showLink={false}
							className="w-72"
						/>
					) : (
						<ResourceItem
							resource={{
								parentId: item.parentId!,
								resourceId: item.resourceId,
								category: category,
							}}
							imageWidthAndHeight={60}
							textClassName="font-medium"
							showArtist={false}
							showLink={false}
							className="w-72"
						/>
					)}
				</View>
			))}
		</View>
	);
};

export default ListResources;

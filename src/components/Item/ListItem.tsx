import ListImage from "@/components/List/ListImage";
import { UserAvatar } from "@/components/UserAvatar";
import { Text } from "@/components/ui/text";
import { getImageUrl } from "@/lib/image";
import { ListsType } from "@/types";
import { Link, RelativePathString } from "expo-router";
import { View } from "react-native";

const ListsItem = ({
	listsItem,
	size = 175,
	showProfile = false,
	onPress,
}: {
	listsItem: ListsType;
	showProfile?: boolean;
	size?: number;
	onPress?: (_listId: string) => void;
}) => {
	if (!listsItem.id || !listsItem.profile) return null;
	const profile = listsItem.profile;
	const listResources = listsItem.resources;

	const ListItemContent = (
		<View className="flex flex-col justify-center" style={{ width: size }}>
			<View className="flex items-center justify-center">
				<ListImage
					listItems={listResources}
					category={listsItem.category}
					size={size}
				/>
			</View>
			<Text
				className={"mr-3 w-full text-ellipsis font-semibold"}
				numberOfLines={1}
				style={{ flexWrap: "wrap" }}
			>
				{listsItem.name}
			</Text>
		</View>
	);

	const link = `/lists/${String(listsItem.id)}` as RelativePathString;

	return (
		<View
			className="flex flex-col gap-96"
			style={{
				width: size,
			}}
		>
			<Link href={link} className="flex w-full flex-col">
				{ListItemContent}
			</Link>

			{showProfile && (
				<Link href={`/${String(profile.handle)}`}>
					<View className="flex flex-row space-x-1 py-1 text-sm text-muted-foreground hover:underline">
						<UserAvatar imageUrl={getImageUrl(profile)} />
						<Text className="flex">{profile.name}</Text>
					</View>
				</Link>
			)}
		</View>
	);
};

export default ListsItem;

import NotFoundScreen from "@/app/+not-found";
import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import ListImage from "@/components/List/ListImage";
import Metadata from "@/components/Metadata";
import { RatingInfo } from "@/components/Rating/RatingInfo";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { ListPlus, Pencil, Settings } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { cn, timeAgo } from "@/lib";
import { Category, ListItem } from "@/types";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ListResources = ({
	items,
	category,
}: {
	items: ListItem[] | undefined;
	category: Category;
}) => {
	const size = Platform.OS === "web" ? 70 : 60;
	return (
		<>
			{items?.map((item, index) => (
				<View
					key={item.resourceId}
					className={cn(
						"w-full border-muted",
						index !== items.length - 1 && "border-b",
					)}
				>
					<View
						className={cn(
							"my-2 flex flex-row items-center justify-between gap-3",
						)}
					>
						<View className="flex flex-row items-center px-4">
							<Text className="w-6 font-bold text-base text-muted-foreground">
								{index + 1}
							</Text>
							{category === "ARTIST" ? (
								<ArtistItem
									artistId={item.resourceId}
									imageWidthAndHeight={size}
									textClassName={cn(
										"font-medium",
										item.rating ? "w-52 lg:w-full" : "w-64",
									)}
								/>
							) : (
								<ResourceItem
									resource={{
										parentId: item.parentId!,
										resourceId: item.resourceId,
										category: category,
									}}
									imageWidthAndHeight={size}
									textClassName={cn(
										"font-medium",
										item.rating ? "w-52 lg:w-full" : "w-64",
									)}
									showArtist={false}
								/>
							)}
						</View>
						<View className="pr-4">
							<RatingInfo
								initialRating={{
									resourceId: item.resourceId,
									average: item.rating
										? String(item.rating)
										: null,
									total: 1,
								}}
								resource={{
									parentId: item.parentId!,
									resourceId: item.resourceId,
									category: category,
								}}
								size="sm"
							/>
						</View>
					</View>
				</View>
			))}
		</>
	);
};

const ListPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const listId = id!;

	const { data: list } = useSuspenseQuery(
		api.lists.get.queryOptions({ id: listId }),
	);

	if (!list) return <NotFoundScreen />;

	const profile = useAuth((s) => s.profile!);
	const isProfile = profile.userId === list?.userId;

	const { data: listItems } = useSuspenseQuery(
		api.lists.resources.get.queryOptions({
			listId,
			userId: list!.userId,
		}),
	);
	const dimensions = useWindowDimensions();

	const options =
		Platform.OS !== "web"
			? {
					title: `${list.name}`,
					headerRight: () =>
						isProfile ? (
							<Link
								href={{
									pathname: "/lists/[id]/settings",
									params: { id: listId },
								}}
								className="p-2"
							>
								<Settings
									size={22}
									className="text-foreground"
								/>
							</Link>
						) : null,
				}
			: {};

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<ScrollView className="flex h-full flex-col gap-6">
				<WebWrapper>
					<Stack.Screen options={options} />
					<Metadata
						type={`${list.category} LIST`}
						title={list.name}
						cover={
							<ListImage
								listItems={listItems as ListItem[]}
								category={list!.category}
								size={200}
							/>
						}
						size="sm"
					>
						<View className="flex flex-col items-center sm:items-start">
							<View className="flex flex-row items-center gap-2">
								<Link
									href={{
										pathname: "/[handle]",
										params: {
											handle: String(
												list?.profile.handle,
											),
										},
									}}
								>
									<View className="flex flex-row items-center gap-2">
										<UserAvatar
											imageUrl={getImageUrl(
												list!.profile,
											)}
										/>
										<Text className="flex text-lg">
											{list!.profile.name}
										</Text>
									</View>
								</Link>
								<Text className="text-muted-foreground">
									• {timeAgo(list!.updatedAt)}
								</Text>
							</View>
						</View>
					</Metadata>
					{isProfile && Platform.OS != "web" && (
						<View className="my-4 flex flex-row justify-around">
							<Link
								href={{
									pathname: "/(modals)/list/searchResource",
									params: {
										listId,
										category: list.category,
										isTopList: list.onProfile.toString(),
									},
								}}
								asChild
							>
								<Button
									variant="outline"
									style={{
										width: dimensions.width / 2 - 5,
										flexDirection: "row",
										gap: 15,
									}}
								>
									<Text variant="h4">Add</Text>
									<ListPlus
										className="text-foreground"
										size={22}
									/>
								</Button>
							</Link>
							<Link
								href={{
									pathname: "/(modals)/list/rearrangeList",
									params: {
										listId,
									},
								}}
								asChild
							>
								<Button
									variant="outline"
									style={{
										width: dimensions.width / 2 - 5,
										flexDirection: "row",
										gap: 15,
									}}
								>
									<Text variant="h4">Edit</Text>
									<Pencil
										className="text-foreground"
										size={18}
									/>
								</Button>
							</Link>
						</View>
					)}
					<ListResources
						items={listItems as ListItem[]}
						category={list!.category}
					/>
					{Platform.OS != "web" &&
						listItems?.length == 0 &&
						isProfile && (
							<View className="flex h-56 flex-col items-center justify-center gap-2">
								<ListPlus size={30} />
								<Text
									variant="h4"
									className="text-muted-foreground"
								>
									Make Sure to Add to Your List
								</Text>
							</View>
						)}
				</WebWrapper>
			</ScrollView>
		</SafeAreaView>
	);
};

export default ListPage;

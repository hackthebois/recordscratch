import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { cn } from "@recordscratch/lib";
import { Category, ListWithResources, UserListItem } from "@recordscratch/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import { ArtistItem } from "../Item/ArtistItem";
import { ResourceItem } from "../Item/ResourceItem";
import { Button } from "../ui/button";
import { Eraser, Trash2 } from "@/lib/icons/IconsLoader";
import { useState } from "react";

export const DeleteButton = ({
	isVisible = false,
	position,
	onPress,
	className,
}: {
	isVisible: boolean;
	position: number;
	className?: string;
	onPress: (position: number) => void;
}) => {
	return (
		isVisible && (
			<Button
				className={cn("size-9", className)}
				onPress={() => onPress(position)}
				variant="destructive"
				size="icon">
				<Trash2 size={18} />
			</Button>
		)
	);
};

const Resource = ({
	resource,
	category,
	top6Width,
}: {
	resource: UserListItem;
	category: Category;
	top6Width: number;
}) => {
	const props = {
		direction: "vertical" as any,
		textClassName: "line-clamp-2 truncate w-38 text-wrap text-center sm:line-clamp-3",
		imageWidthAndHeight: top6Width,
		style: { width: top6Width },
	};
	return category != "ARTIST" ? (
		<ResourceItem
			resource={{
				parentId: resource.parentId!,
				resourceId: resource.resourceId,
				category,
			}}
			showArtist={false}
			{...props}
		/>
	) : (
		<ArtistItem artistId={resource.resourceId} {...props} />
	);
};

export const TopList = ({
	category,
	editMode,
	isUser,
	list,
	setEditMode,
}: {
	category: Category;
	editMode: boolean;
	isUser: boolean;
	list: ListWithResources | undefined;
	setEditMode: (edit: boolean) => void;
}) => {
	const { id: listId, resources = [] } = list || {};
	const utils = api.useUtils();
	const userId = useAuth((s) => s.profile!.userId);
	const screenSize = Math.min(useWindowDimensions().width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width = (Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns;
	const router = useRouter();

	const { mutate: deleteResource } = api.lists.resources.delete.useMutation({
		onSuccess: () => {
			utils.lists.topLists.invalidate({ userId });
			utils.lists.getUser.invalidate({ userId });
		},
	});
	const { mutate: createList } = api.lists.create.useMutation({
		onSuccess: (id) => {
			utils.lists.topLists.invalidate({ userId });
			utils.lists.getUser.invalidate({ userId });

			router.push({
				pathname: "/(modals)/list/searchResource",
				params: {
					category: category,
					listId: id,
					isTopList: "true",
				},
			});
		},
	});
	const className = "relative mb-1 h-auto overflow-hidden mt-2";
	return (
		<View className="flex flex-row flex-wrap gap-3 px-2">
			{resources.map((resource) => (
				<View className={className} key={resource.resourceId}>
					<Resource resource={resource} category={category} top6Width={top6Width} />
					<DeleteButton
						isVisible={editMode}
						position={resource.position}
						className="absolute right-0.5 top-0.5"
						onPress={() => {
							deleteResource({
								resourceId: resource.resourceId,
								listId: resource.listId,
							});
							if (resources.length === 1) setEditMode(false);
						}}
					/>
				</View>
			))}
			{resources.length < 6 && isUser && (
				<Button
					variant={"outline"}
					className={cn(className, category === "ARTIST" ? "rounded-full" : "rounded-lg")}
					style={{
						width: top6Width,
						height: top6Width,
					}}
					onPress={() => {
						if (!list)
							createList({
								name: `My Top 6 ${category.toLowerCase()}s`,
								category,
								onProfile: true,
							});
						else
							router.push({
								pathname: "/(modals)/list/searchResource",
								params: {
									category: category,
									listId: listId,
									isTopList: "true",
								},
							});

						setEditMode(false);
					}}>
					<Text className="w-20 text-center capitalize">
						Add {category.toLowerCase()}
					</Text>
				</Button>
			)}
		</View>
	);
};

export const TopListTab = ({
	tab = "ALBUM",
	album,
	song,
	artist,
	isUser,
}: {
	tab: string;
	album: ListWithResources | undefined;
	song: ListWithResources | undefined;
	artist: ListWithResources | undefined;
	isUser: boolean;
}) => {
	const [value, setValue] = useState(tab);
	const [editMode, setEditMode] = useState(false);

	return (
		<View>
			<Tabs value={value} onValueChange={setValue}>
				<View className="mt-2">
					<TabsList className="w-full flex-row">
						<TabsTrigger value="ALBUM" className="flex-1">
							<Text>Albums</Text>
						</TabsTrigger>
						<TabsTrigger value="SONG" className="flex-1">
							<Text>Songs</Text>
						</TabsTrigger>
						<TabsTrigger value="ARTIST" className="flex-1">
							<Text>Artists</Text>
						</TabsTrigger>
					</TabsList>
				</View>
				<TabsContent value="ALBUM">
					<TopList
						category="ALBUM"
						setEditMode={setEditMode}
						editMode={editMode}
						list={album}
						isUser={isUser}
					/>
				</TabsContent>
				<TabsContent value="SONG">
					<TopList
						category="SONG"
						setEditMode={setEditMode}
						editMode={editMode}
						list={song}
						isUser={isUser}
					/>
				</TabsContent>
				<TabsContent value="ARTIST">
					<TopList
						category="ARTIST"
						setEditMode={setEditMode}
						editMode={editMode}
						list={artist}
						isUser={isUser}
					/>
				</TabsContent>
			</Tabs>
			{isUser ? (
				<Button
					className="flex w-full items-center"
					variant={editMode ? "destructive" : "outline"}
					onPress={() => {
						setEditMode(!editMode);
					}}>
					<Eraser size={20} className="text-foreground" />
				</Button>
			) : null}
		</View>
	);
};

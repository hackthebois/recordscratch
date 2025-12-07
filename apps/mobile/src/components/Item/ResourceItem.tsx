import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { getQueryOptions } from "@/lib/deezer";
import { Album, cn } from "@recordscratch/lib";
import { Resource } from "@recordscratch/types";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { RelativePathString, useRouter } from "expo-router";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

export const ResourceItemSkeleton = ({
	direction = "horizontal",
	imageCss,
	imageWidthAndHeight = 150,
	showArtist = true,
}: {
	direction?: "horizontal" | "vertical";
	imageCss?: string;
	imageWidthAndHeight?: number;
	showArtist?: boolean;
}) => {
	return (
		<View
			className={cn(
				"flex gap-4",
				direction === "vertical" ? "flex-col" : "flex-row items-center"
			)}
			style={{
				width: direction === "vertical" ? imageWidthAndHeight : "100%",
			}}>
			<View
				style={{
					width: imageWidthAndHeight,
					height: imageWidthAndHeight,
				}}>
				<Skeleton className={cn(`h-full w-full rounded-xl`, imageCss)} />
			</View>
			<View className="flex flex-1 flex-col gap-2">
				<Skeleton className="h-6 w-[80%] max-w-[300px]" />
				{showArtist ? <Skeleton className="h-6 w-[60%] max-w-[220px]" /> : null}
			</View>
		</View>
	);
};

export const ResourceItem = ({
	initialAlbum,
	resource,
	showType,
	onPress,
	showLink = true,
	direction = "horizontal",
	imageClassName,
	textClassName,
	showArtist = true,
	className,
	imageWidthAndHeight = 150,
	artistClassName,
	style,
}: {
	initialAlbum?: Album;
	resource: Resource;
	showType?: boolean;
	onPress?: () => void;
	showLink?: boolean;
	direction?: "horizontal" | "vertical";
	imageClassName?: string;
	imageWidthAndHeight?: number;
	textClassName?: string;
	artistClassName?: string;
	showArtist?: boolean;
	className?: string;
	width?: number;
	style?: StyleProp<ViewStyle>;
}) => {
	const router = useRouter();
	const albumId = resource.category === "SONG" ? resource.parentId : resource.resourceId;

	const { data: album, isLoading } = useQuery({
		...getQueryOptions({
			route: "/album/{id}",
			input: {
				id: albumId,
			},
		}),
		initialData: initialAlbum,
	});
	const { data: tracks, isLoading: isLoadingTracks } = useQuery({
		...getQueryOptions({
			route: "/album/{id}/tracks",
			input: {
				id: albumId,
				limit: 1000,
			},
		}),
		enabled: resource.category === "SONG",
	});

	if (isLoading || !album || (resource.category === "SONG" && isLoadingTracks)) {
		return (
			<ResourceItemSkeleton
				direction={direction}
				imageCss={imageClassName}
				imageWidthAndHeight={imageWidthAndHeight}
				showArtist={showArtist}
			/>
		);
	}

	const name =
		resource.category === "SONG"
			? tracks?.data.find((track) => track.id === Number(resource.resourceId))?.title
			: album?.title;

	const link = (
		resource.category === "SONG"
			? `/albums/${resource.parentId}/songs/${resource.resourceId}`
			: `/albums/${resource.resourceId}`
	) as RelativePathString;

	return (
		<Pressable
			onPress={() => {
				if (onPress) onPress();
				if (showLink) router.push(link);
			}}>
			<View
				className={cn(
					"flex items-center gap-4",
					className,
					direction === "vertical" ? "flex-col" : "flex-row"
				)}
				style={[
					{
						width: direction === "vertical" ? imageWidthAndHeight : "auto",
					},
					style,
				]}>
				<View className="overflow-hidden rounded-xl">
					{album?.cover_big ? (
						<Image
							source={album.cover_big}
							style={{
								width: imageWidthAndHeight,
								height: imageWidthAndHeight,
								borderRadius: 12,
							}}
							className={cn(
								"aspect-square overflow-hidden rounded-xl transition-all hover:scale-105",
								imageClassName
							)}
						/>
					) : (
						<View className="h-full w-full bg-muted"></View>
					)}
				</View>
				<View
					className={cn(
						"flex flex-col gap-2",
						direction === "horizontal" ? "w-full" : ""
					)}
					style={{
						width: direction === "vertical" ? imageWidthAndHeight : "auto",
					}}>
					<Text
						className={cn("w-full text-ellipsis font-semibold", textClassName)}
						numberOfLines={direction === "horizontal" ? 2 : 1}
						style={{ flexWrap: "wrap" }}>
						{name}
					</Text>
					<View className="flex flex-row gap-1 self-baseline">
						{showType && (
							<Text className="text-muted-foreground">
								{resource.category === "SONG" ? "Song" : "Album"}
							</Text>
						)}
						{showArtist && (
							<Text className={cn("text-muted-foreground", artistClassName)}>
								{showType ? "• " : ""}
								{album?.artist?.name}
							</Text>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	);
};

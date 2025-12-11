import { Text } from "@/components/ui/text";
import { getQueryOptions } from "@/lib/deezer";
import { Artist, cn } from "@recordscratch/lib";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { Skeleton } from "../ui/skeleton";

export const ArtistItem = ({
	initialArtist,
	artistId,
	onPress,
	direction = "horizontal",
	showLink = true,
	textClassName,
	imageClassName,
	className,
	imageWidthAndHeight = 100,
	showType = false,
	style,
}: {
	initialArtist?: Artist;
	artistId: string;
	onPress?: () => void;
	direction?: "horizontal" | "vertical";
	showLink?: boolean;
	textClassName?: string;
	imageClassName?: string;
	imageWidthAndHeight?: number;
	className?: string;
	showType?: boolean;
	style?: StyleProp<ViewStyle>;
}) => {
	const router = useRouter();
	const { data: artist } = useQuery({
		...getQueryOptions({
			route: "/artist/{id}",
			input: {
				id: artistId,
			},
		}),
		initialData: initialArtist,
	});

	if (!artist) {
		return (
			<View
				className={cn(
					"flex items-center gap-4",
					className,
					direction === "vertical" ? "flex-col" : "flex-row"
				)}>
				<View
					style={{
						width: imageWidthAndHeight,
						height: imageWidthAndHeight,
					}}>
					<Skeleton className="relative h-full w-full rounded-full" />
				</View>
				<View className="justify-center gap-1">
					<Skeleton className="mb-1 h-4 w-32" />
					{showType ? <Skeleton className="h-4 w-24" /> : null}
				</View>
			</View>
		);
	}

	const artistImage = artist.picture_xl;

	return (
		<Pressable
			onPress={() => {
				if (onPress) onPress();
				if (showLink) router.push(`/artists/${String(artist.id)}`);
			}}>
			<View
				className={cn(
					"flex items-center gap-4",
					className,
					direction === "vertical" ? "flex-col" : "flex-row"
				)}
				style={style}>
				<View className="items-center justify-center overflow-hidden rounded-full">
					{artistImage ? (
						<Image
							source={artistImage}
							className={cn("border-2 sm:border-0", imageClassName)}
							contentFit="cover"
							style={{
								width: imageWidthAndHeight,
								height: imageWidthAndHeight,
							}}
						/>
					) : (
						<View className="h-full bg-muted"></View>
					)}
				</View>
				<View className="justify-center gap-1">
					<Text
						className={cn(
							"flex font-semibold",
							direction === "vertical" ? "text-center" : "",
							textClassName
						)}
						numberOfLines={2}>
						{artist.name}
					</Text>
					{showType && <Text className="text-muted-foreground">{"Artist"}</Text>}
				</View>
			</View>
		</Pressable>
	);
};

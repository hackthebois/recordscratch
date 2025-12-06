import NotFoundScreen from "@/app/+not-found";
import AlbumItem from "@/components/Item/AlbumItem";
import Metadata from "@/components/Metadata";
import { getQueryOptions } from "@/lib/deezer";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { WebWrapper } from "@/components/WebWrapper";
import { ArtistItem } from "@/components/Item/ArtistItem";

const GenrePage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const genreId = id;

	const { data: genre } = useSuspenseQuery(
		getQueryOptions({
			route: "/editorial/{id}",
			input: { id: genreId },
		})
	);

	if (!genre) return <NotFoundScreen />;

	const { data: related } = useSuspenseQuery(
		getQueryOptions({
			route: "/genre/{id}/artists",
			input: {
				id: genreId,
			},
		})
	);

	const { data: releases } = useSuspenseQuery(
		getQueryOptions({
			route: "/editorial/{id}/releases",
			input: {
				id: genreId,
				limit: 20,
			},
		})
	);

	return (
		<SafeAreaProvider>
			<Stack.Screen />
			<ScrollView>
				<WebWrapper>
					<Metadata title={genre.name} cover={genre.picture_big}>
						<></>
					</Metadata>
					<View className="px-4">
						<Text variant="h2" className="pb-4 pt-6">
							Recent {genre.name} Releases
						</Text>
						<FlashList
							data={releases.data}
							renderItem={({ item }) => <AlbumItem resourceId={String(item.id)} />}
							horizontal
							showsHorizontalScrollIndicator={Platform.OS === "web"}
							estimatedItemSize={160}
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => <View className="w-4" />}
						/>
						<Text variant="h2" className="pb-4 pt-6">
							Top {genre.name} Artists
						</Text>
						<FlashList
							data={related.data}
							renderItem={({ item }) => (
								<ArtistItem
									artistId={String(item.id)}
									direction="vertical"
									imageWidthAndHeight={115}
									className="max-w-32"
									textClassName="line-clamp-2"
								/>
							)}
							horizontal
							showsHorizontalScrollIndicator={Platform.OS === "web"}
							estimatedItemSize={115}
							contentContainerClassName="h-48"
							ItemSeparatorComponent={() => <View className="w-4" />}
						/>
					</View>
				</WebWrapper>
			</ScrollView>
		</SafeAreaProvider>
	);
};
export default GenrePage;

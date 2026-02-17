import NotFoundScreen from "@/app/+not-found";
import AlbumItem from "@/components/Item/AlbumItem";
import Metadata from "@/components/Metadata";
import { getQueryOptions } from "@/lib/deezer";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { WebWrapper } from "@/components/WebWrapper";
import { ArtistItem } from "@/components/Item/ArtistItem";
import { Page } from "@/components/Page";

const GenrePage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const genreId = id;

	const { data: genre } = useSuspenseQuery(
		getQueryOptions({
			route: "/editorial/{id}",
			input: { id: genreId },
		}),
	);

	if (!genre) return <NotFoundScreen />;

	const { data: related } = useSuspenseQuery(
		getQueryOptions({
			route: "/genre/{id}/artists",
			input: {
				id: genreId,
			},
		}),
	);

	const { data: releases } = useSuspenseQuery(
		getQueryOptions({
			route: "/editorial/{id}/releases",
			input: {
				id: genreId,
				limit: 20,
			},
		}),
	);

	return (
		<Page title={genre.name}>
			<ScrollView>
				<WebWrapper>
					<Metadata title={genre.name} cover={genre.picture_big}>
						<></>
					</Metadata>
					<View className="px-4">
						<Text variant="h3" className="pt-6 pb-4">
							Recent {genre.name} Releases
						</Text>
						<FlashList
							data={releases.data}
							renderItem={({ item }) => (
								<AlbumItem resourceId={String(item.id)} />
							)}
							horizontal
							showsHorizontalScrollIndicator={
								Platform.OS === "web"
							}
							contentContainerClassName="h-60"
							ItemSeparatorComponent={() => (
								<View className="w-4" />
							)}
						/>
						<Text variant="h3" className="pt-6 pb-4">
							Top {genre.name} Artists
						</Text>
						<FlashList
							data={related.data}
							renderItem={({ item }) => (
								<ArtistItem
									artistId={String(item.id)}
									direction="vertical"
									imageWidthAndHeight={105}
									className="max-w-32"
								/>
							)}
							horizontal
							showsHorizontalScrollIndicator={
								Platform.OS === "web"
							}
							contentContainerClassName="h-48"
							ItemSeparatorComponent={() => (
								<View className="w-4" />
							)}
						/>
					</View>
				</WebWrapper>
			</ScrollView>
		</Page>
	);
};
export default GenrePage;

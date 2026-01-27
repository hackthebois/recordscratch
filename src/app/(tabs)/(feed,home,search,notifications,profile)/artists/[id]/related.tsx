import { ArtistItem } from "@/components/Item/ArtistItem";
import { getQueryOptions } from "@/lib/deezer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Platform, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { WebWrapper } from "@/components/WebWrapper";
import { Page } from "@/components/Page";

const RelatedPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const artistId = id!;
	const dimensions = useWindowDimensions();
	const screenSize = Math.min(dimensions.width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width =
		(Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns -
		1;

	const { data: artist } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}",
			input: {
				id: artistId,
			},
		}),
	);
	const { data: artists } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/related",
			input: {
				id: artistId,
			},
		}),
	);

	return (
		<Page title={`Related Artists to ${artist.name}`}>
			<FlatList
				ListHeaderComponent={
					Platform.OS === "web" ? (
						<WebWrapper>
							<Text variant="h2" className="pb-4">
								Related Artists to {artist.name}
							</Text>
						</WebWrapper>
					) : (
						<></>
					)
				}
				data={artists.data}
				renderItem={({ item }) => (
					<ArtistItem
						artistId={String(item.id)}
						initialArtist={item}
						direction="vertical"
						imageWidthAndHeight={top6Width}
						style={{
							maxWidth: top6Width,
						}}
					/>
				)}
				columnWrapperStyle={{
					flexDirection: "row",
					flexWrap: "wrap",
					marginBottom: 16,
					gap: 16,
				}}
				contentContainerStyle={{
					maxWidth: 1024,
					width: "100%",
					marginHorizontal: "auto",
					paddingHorizontal: 16,
				}}
				keyboardShouldPersistTaps="always"
				keyboardDismissMode="interactive"
				numColumns={numColumns}
			/>
		</Page>
	);
};

export default RelatedPage;

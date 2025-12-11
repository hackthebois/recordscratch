import { getQueryOptions } from "@/lib/deezer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebWrapper } from "@/components/WebWrapper";
import { useWindowDimensions } from "react-native";
import { ResourceItem } from "@/components/Item/ResourceItem";

const DiscographyPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const dimensions = useWindowDimensions();
	const screenSize = Math.min(dimensions.width, 1024);
	const numColumns = screenSize === 1024 ? 6 : 3;
	const top6Width = (Math.min(screenSize, 1024) - 32 - (numColumns - 1) * 16) / numColumns - 1;

	const artistId = id!;

	const { data: artist } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}",
			input: {
				id: artistId,
			},
		})
	);

	const { data: albums } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/albums",
			input: {
				id: artistId,
				limit: 100,
			},
		})
	);

	return (
		<SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
			<Stack.Screen
				options={{
					title: `${artist.name}'s Discography`,
				}}
			/>
			<ScrollView>
				<WebWrapper>
					<View className="p-4">
						{Platform.OS === "web" && (
							<Text variant="h2" className="pb-4">
								{artist.name}'s Discography
							</Text>
						)}
						<View className="flex flex-row flex-wrap gap-4">
							{albums?.data?.map((album) => (
								<ResourceItem
									key={album.id}
									initialAlbum={album}
									resource={{
										resourceId: String(album.id),
										category: "ALBUM",
										parentId: String(artist.id),
									}}
									imageWidthAndHeight={top6Width}
									showArtist={false}
									direction="vertical"
								/>
							))}
						</View>
					</View>
				</WebWrapper>
			</ScrollView>
		</SafeAreaView>
	);
};

export default DiscographyPage;

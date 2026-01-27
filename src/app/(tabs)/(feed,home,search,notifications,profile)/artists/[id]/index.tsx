import AlbumItem from "@/components/Item/AlbumItem";
import { ArtistItem } from "@/components/Item/ArtistItem";
import AddToListButton from "@/components/List/AddToListButton";
import Metadata from "@/components/Metadata";
import { Page } from "@/components/Page";
import { RatingInfo } from "@/components/Rating/RatingInfo";
import SongTable from "@/components/SongTable";
import { WebWrapper } from "@/components/WebWrapper";
import { Text } from "@/components/ui/text";
import { getQueryOptions } from "@/lib/deezer";
import { ChevronRight } from "@/lib/icons/IconsLoader";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, View } from "react-native";

const ArtistPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const artistId = id!;

	const { data: artist } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}",
			input: {
				id: artistId,
			},
		}),
	);
	const { data: top } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/top",
			input: {
				id: artistId,
				limit: 5,
			},
		}),
	);
	const { data: albums } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/albums",
			input: {
				id: artistId,
				limit: 20,
			},
		}),
	);
	const { data: artists } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/related",
			input: {
				id: artistId,
				limit: 20,
			},
		}),
	);

	return (
		<Page>
			<View className="flex-1">
				<ScrollView>
					<WebWrapper>
						<View className="flex flex-row justify-center sm:justify-start">
							<Metadata
								title={artist.name}
								cover={artist.picture_big ?? ""}
								type="ARTIST"
							>
								<View className="flex flex-row items-center justify-center gap-3 sm:justify-start">
									<RatingInfo
										resource={{
											resourceId: String(artist.id),
											category: "ARTIST",
											parentId: "",
										}}
									/>
									<AddToListButton
										resourceId={String(artist.id)}
										category="ARTIST"
									/>
								</View>
							</Metadata>
						</View>
						<View className="px-4">
							<View className="pb-4">
								<Link
									href={{
										pathname: "/artists/[id]/top",
										params: { id: artistId },
									}}
								>
									<View className="flex w-full flex-row items-center pt-6 pb-4">
										<Text variant="h2">Top Songs</Text>
										<ChevronRight
											size={30}
											className="color-muted-foreground"
										/>
									</View>
								</Link>
								<SongTable songs={top.data} />
							</View>
							<View className="pb-4">
								<Link
									href={{
										pathname: "/artists/[id]/discography",
										params: { id: artistId },
									}}
								>
									<View className="flex w-full flex-row items-center pt-6 pb-4">
										<Text variant="h2">Discography</Text>
										<ChevronRight
											size={30}
											className="color-muted-foreground"
										/>
									</View>
								</Link>
								<FlashList
									data={albums.data}
									renderItem={({ item }) => (
										<AlbumItem
											resourceId={String(item.id)}
										/>
									)}
									horizontal
									showsHorizontalScrollIndicator={
										Platform.OS === "web"
									}
									contentContainerClassName="h-64"
									ItemSeparatorComponent={() => (
										<View className="w-4" />
									)}
								/>
								<Link
									href={{
										pathname: "/artists/[id]/related",
										params: { id: artistId },
									}}
								>
									<View className="flex w-full flex-row items-center pt-6 pb-4">
										<Text variant="h2">
											Related Artists
										</Text>
										<ChevronRight
											size={30}
											className="color-muted-foreground"
										/>
									</View>
								</Link>
								<FlashList
									data={artists.data}
									renderItem={({ item: artist }) => (
										<ArtistItem
											artistId={String(artist.id)}
											initialArtist={artist}
											direction="vertical"
											imageWidthAndHeight={105}
											className="max-w-32"
											textClassName="line-clamp-2"
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
						</View>
					</WebWrapper>
				</ScrollView>
			</View>
		</Page>
	);
};

export default ArtistPage;

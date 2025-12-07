import NotFoundScreen from "@/app/+not-found";
import StatBlock from "@/components/CoreComponents/StatBlock";
import AlbumItem from "@/components/Item/AlbumItem";
import AddToListButton from "@/components/List/AddToListButton";
import Metadata from "@/components/Metadata";
import RateButton from "@/components/Rating/RateButton";
import { RatingInfo } from "@/components/Rating/RatingInfo";
import SongTable from "@/components/SongTable";
import { WebWrapper } from "@/components/WebWrapper";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { getQueryOptions } from "@/lib/deezer";
import { ChevronRight } from "@/lib/icons/IconsLoader";
import { formatDuration } from "@recordscratch/lib";
import { Resource } from "@recordscratch/types";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlbumLayout() {
	const { albumId } = useLocalSearchParams<{ albumId: string }>();
	const id = albumId!;

	const [total] = api.ratings.count.useSuspenseQuery({
		resourceId: id,
		category: "ALBUM",
	});

	const { data: album } = useSuspenseQuery(
		getQueryOptions({
			route: "/album/{id}",
			input: { id },
		})
	);

	if (!album) return <NotFoundScreen />;

	const { data: songs } = useSuspenseQuery({
		...getQueryOptions({
			route: "/album/{id}/tracks",
			input: { id, limit: 1000 },
		}),
		initialData: {
			data: album?.tracks?.data ?? [],
		},
	});

	const { data: albums } = useSuspenseQuery(
		getQueryOptions({
			route: "/artist/{id}/albums",
			input: {
				id: String(album.artist!.id),
				limit: 20,
			},
		})
	);

	const resource: Resource = {
		parentId: String(album.artist?.id),
		resourceId: String(album.id),
		category: "ALBUM",
	};

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<Stack.Screen />
			<View className="flex flex-1">
				<ScrollView contentContainerClassName="pb-4">
					<WebWrapper>
						<Metadata
							title={album.title}
							type={album.record_type}
							cover={album.cover_big}
							tags={[
								album.release_date,
								album.duration ? `${formatDuration(album.duration)}` : undefined,
							]}
							genres={album.genres?.data ?? []}>
							<View className="flex flex-row items-center justify-center sm:justify-start">
								{album.contributors?.map((artist, index) => (
									<Pressable
										onPress={() => {
											router.navigate(`/artists/${artist?.id}`);
										}}
										style={{ maxWidth: "100%" }}>
										<Text className="text-center text-muted-foreground sm:text-left">
											{`${artist?.name + (album.contributors?.length === index + 1 ? "" : ",  ")}`}
										</Text>
									</Pressable>
								))}
							</View>

							<View className="my-4 flex-row items-center justify-center gap-4 sm:justify-start">
								<RatingInfo resource={resource} size="lg" />
								<RateButton
									imageUrl={album.cover_big}
									resource={resource}
									name={album.title}
								/>
								<AddToListButton
									resourceId={String(album.id)}
									parentId={String(album.artist?.id)}
									category={"ALBUM"}
								/>
							</View>
							<Link href={`/albums/${album.id}/reviews`} asChild>
								<Pressable>
									<StatBlock title="Ratings" description={String(total)} />
								</Pressable>
							</Link>
						</Metadata>
						<SongTable
							songs={songs.data!.map((song) => ({
								...song,
								album,
							}))}
						/>
						<View className="px-4">
							<Link
								href={{
									pathname: "/artists/[id]/discography",
									params: { id: String(album.artist?.id) },
								}}>
								<View className="flex w-full flex-row items-center pb-4 pt-6">
									<Text variant="h4">More From {album.artist?.name}</Text>
									<ChevronRight size={30} className="color-muted-foreground" />
								</View>
							</Link>
							<FlashList
								data={albums.data}
								renderItem={({ item }) =>
									item.id != album.id ? (
										<AlbumItem resourceId={String(item.id)} />
									) : null
								}
								contentContainerClassName="h-64"
								horizontal
								showsHorizontalScrollIndicator={Platform.OS === "web"}
								ItemSeparatorComponent={() => <View className="w-4" />}
							/>
						</View>
					</WebWrapper>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

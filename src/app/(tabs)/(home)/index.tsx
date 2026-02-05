import AlbumItem from "@/components/Item/AlbumItem";
import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItemSkeleton } from "@/components/Item/ResourceItem";
import Metadata from "@/components/Metadata";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getQueryOptions } from "@/lib/deezer";
import { formatDuration } from "@/lib";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SplashScreen, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, View } from "react-native";
import NotFound from "../../+not-found";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";

const AlbumOfTheDay = () => {
	const router = useRouter();
	const { data: albumOfTheDay } = useSuspenseQuery(
		api.misc.albumOfTheDay.queryOptions(),
	);
	const { data: album } = useSuspenseQuery(
		getQueryOptions({
			route: "/album/{id}",
			input: { id: albumOfTheDay.albumId },
		}),
	);

	if (!album) return <NotFound />;

	return (
		<Metadata
			title={album.title}
			cover={album.cover_big}
			type="ALBUM OF THE DAY"
			tags={[
				album.release_date,
				album.duration
					? `${formatDuration(album.duration)}`
					: undefined,
			]}
			genres={album.genres?.data ?? []}
		>
			<Button
				variant="secondary"
				onPress={() => {
					router.navigate(`/albums/${albumOfTheDay.albumId}`);
				}}
				className="self-center sm:self-start"
			>
				<Text>Go to Album</Text>
			</Button>
		</Metadata>
	);
};

const HomePage = () => {
	const { data: charts } = useQuery(api.ratings.charts.queryOptions());

	useEffect(() => {
		SplashScreen.hide();
	}, []);

	return (
		<Page title="Home">
			<ScrollView
				contentContainerClassName="flex flex-col pb-4 items-center"
				nestedScrollEnabled
			>
				<View className="w-full max-w-5xl">
					<AlbumOfTheDay />
					<View className="px-4">
						<Text variant="h3" className="pt-6 pb-4">
							Trending Albums
						</Text>
						<FlashList
							data={charts?.albums.trending}
							renderItem={({ item }) => (
								<AlbumItem resourceId={item} />
							)}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => (
								<View className="w-4" />
							)}
							ListEmptyComponent={
								<ScrollView
									horizontal
									contentContainerClassName="gap-4"
								>
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={
								Platform.OS === "web"
							}
						/>
						<Text variant="h3" className="pt-6 pb-4">
							Top Albums
						</Text>
						<FlashList
							data={charts?.albums.top}
							renderItem={({ item }) => (
								<AlbumItem resourceId={item} />
							)}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => (
								<View className="w-4" />
							)}
							ListEmptyComponent={
								<ScrollView
									horizontal
									contentContainerClassName="gap-4"
								>
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={
								Platform.OS === "web"
							}
						/>
						<Text variant="h3" className="pt-6 pb-4">
							Most Popular Albums
						</Text>
						<FlashList
							data={charts?.albums.popular}
							renderItem={({ item }) => (
								<AlbumItem resourceId={item} />
							)}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => (
								<View className="w-4" />
							)}
							ListEmptyComponent={
								<ScrollView
									horizontal
									contentContainerClassName="gap-4"
								>
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={
								Platform.OS === "web"
							}
						/>
						<Text variant="h3" className="pt-6 pb-4">
							Top Artists
						</Text>
						<FlashList
							data={charts?.artists.top}
							renderItem={({ item }) => (
								<ArtistItem
									artistId={item}
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
				</View>
			</ScrollView>
		</Page>
	);
};

export default HomePage;

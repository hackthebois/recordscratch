import AlbumItem from "@/components/Item/AlbumItem";
import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItemSkeleton } from "@/components/Item/ResourceItem";
import Metadata from "@/components/Metadata";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { getQueryOptions } from "@/lib/deezer";
import { formatDuration } from "@recordscratch/lib";
import { FlashList } from "@shopify/flash-list";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SplashScreen, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotFound from "../../+not-found";
import { WebHeaderRight } from "@/components/WebHeaderRight";

const AlbumOfTheDay = () => {
	const [albumOfTheDay] = api.misc.albumOfTheDay.useSuspenseQuery();
	const { data: album } = useSuspenseQuery(
		getQueryOptions({
			route: "/album/{id}",
			input: { id: albumOfTheDay.albumId },
		})
	);

	if (!album) return <NotFound />;
	const router = useRouter();

	return (
		<Metadata
			title={album.title}
			cover={album.cover_big}
			type="ALBUM OF THE DAY"
			tags={[
				album.release_date,
				album.duration ? `${formatDuration(album.duration)}` : undefined,
			]}
			genres={album.genres?.data ?? []}>
			<Button
				variant="secondary"
				onPress={() => {
					router.navigate(`/albums/${albumOfTheDay.albumId}`);
				}}
				className="self-center sm:self-start">
				<Text>Go to Album</Text>
			</Button>
		</Metadata>
	);
};

const HomePage = () => {
	const { data: trending } = api.ratings.trending.useQuery();
	const { data: top } = api.ratings.top.useQuery();
	const { data: popular } = api.ratings.popular.useQuery();
	const { data: topArtists } = api.ratings.topArtists.useQuery();

	useEffect(() => {
		SplashScreen.hide();
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
			<Stack.Screen
				options={{
					title: "Home",
					headerRight: () => <WebHeaderRight />,
				}}
			/>
			<ScrollView
				contentContainerClassName="flex flex-col pb-4 items-center"
				nestedScrollEnabled>
				<View className="w-full max-w-screen-lg">
					<AlbumOfTheDay />
					<View className="px-4">
						<Text variant="h2" className="pb-4 pt-6">
							Trending Albums
						</Text>
						<FlashList
							data={trending}
							renderItem={({ item }) => <AlbumItem {...item} />}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => <View className="w-4" />}
							ListEmptyComponent={
								<ScrollView horizontal contentContainerClassName="gap-4">
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={Platform.OS === "web"}
						/>
						<Text variant="h2" className="pb-4 pt-6">
							Top Albums
						</Text>
						<FlashList
							data={top}
							renderItem={({ item }) => <AlbumItem {...item} />}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => <View className="w-4" />}
							ListEmptyComponent={
								<ScrollView horizontal contentContainerClassName="gap-4">
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={Platform.OS === "web"}
						/>
						<Text variant="h2" className="pb-4 pt-6">
							Most Popular Albums
						</Text>
						<FlashList
							data={popular}
							renderItem={({ item }) => <AlbumItem {...item} />}
							horizontal
							contentContainerClassName="h-64"
							ItemSeparatorComponent={() => <View className="w-4" />}
							ListEmptyComponent={
								<ScrollView horizontal contentContainerClassName="gap-4">
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
									<ResourceItemSkeleton direction="vertical" />
								</ScrollView>
							}
							showsHorizontalScrollIndicator={Platform.OS === "web"}
						/>
						<Text variant="h2" className="pb-4 pt-6">
							Top Artists
						</Text>
						<FlashList
							data={topArtists}
							renderItem={({ item: { artistId } }) => (
								<ArtistItem
									artistId={artistId}
									direction="vertical"
									imageWidthAndHeight={105}
								/>
							)}
							horizontal
							showsHorizontalScrollIndicator={Platform.OS === "web"}
							contentContainerClassName="h-40"
							ItemSeparatorComponent={() => <View className="w-4" />}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default HomePage;

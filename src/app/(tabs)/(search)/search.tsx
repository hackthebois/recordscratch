import { ArtistItem } from "@/components/Item/ArtistItem";
import { ProfileItem } from "@/components/Item/ProfileItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import { SearchOptions, useDebounce } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Platform, TextInput, View } from "react-native";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { deezerHelpers } from "@/lib/deezer";
import { Search } from "@/lib/icons/IconsLoader";
import { WebWrapper } from "@/components/WebWrapper";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";
import { THEME } from "@/lib/theme";

type TabsType = Omit<SearchOptions, "query"> & {
	label: string;
	value: string;
};
const tabs: { [key: string]: TabsType } = {
	all: {
		label: "All",
		value: "all",
		filters: { albums: true, artists: true, songs: true },
		limit: 4,
	},
	songs: {
		label: "Songs",
		value: "songs",
		filters: { albums: false, artists: false, songs: true },
		limit: 12,
	},
	albums: {
		label: "Albums",
		value: "albums",
		filters: { albums: true, artists: false, songs: false },
		limit: 12,
	},
	artists: {
		label: "Artists",
		value: "artists",
		filters: { albums: false, artists: true, songs: false },
		limit: 12,
	},
	profiles: {
		label: "Users",
		value: "profiles",
		filters: { albums: false, artists: false, songs: false },
		limit: 12,
	},
};

export default function SearchPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ query?: string; tab?: string }>();
	const tab = useMemo(
		() =>
			params.tab && params.tab !== "undefined"
				? tabs[params.tab]
				: tabs.all,
		[params.tab],
	);
	const debouncedQuery = useDebounce(params.query ?? "", 1000);

	const { data: music, isLoading } = useQuery({
		queryKey: ["search", debouncedQuery, tab],
		queryFn: async () => {
			return await deezerHelpers().search({
				query: encodeURIComponent(debouncedQuery),
				...tab,
			});
		},
		enabled:
			debouncedQuery.trim().length > 0 &&
			["all", "songs", "albums", "artists"].includes(tab.value),
	});

	const { data: profiles, isLoading: isLoadingProfiles } = useQuery(
		api.profiles.search.queryOptions(
			{ query: debouncedQuery, ...tab },
			{
				gcTime: 0,
				refetchOnMount: false,
				enabled:
					debouncedQuery.trim().length > 0 &&
					["profiles", "all"].includes(tab.value),
			},
		),
	);

	const userProfile = useAuth((s) => s.profile);

	return (
		<Page
			title="Search"
			options={{ headerShown: Platform.OS === "web" }}
			edges={["top", "left", "right"]}
		>
			<WebWrapper>
				<View className="gap-2 px-4 sm:mt-4">
					<View className="border-border h-14 w-full flex-row items-center rounded-xl border pr-4">
						<Search size={20} className="text-foreground mx-4" />
						<TextInput
							id="name"
							autoComplete="off"
							placeholder="Search"
							value={params.query}
							cursorColor={"#ffb703"}
							style={{
								paddingTop: 0,
								paddingBottom: Platform.OS === "ios" ? 4 : 0,
								textAlignVertical: "center",
							}}
							autoCorrect={false}
							autoFocus
							className="text-foreground h-full flex-1 p-0 text-xl outline-none"
							onChangeText={(text) => {
								router.setParams({ query: text });
							}}
						/>
					</View>
					<Tabs
						value={tab.value}
						onValueChange={(value) => {
							if (value === "all") {
								router.setParams({ tab: undefined });
							} else {
								router.setParams({ tab: value });
							}
						}}
					>
						<TabsList className="w-full flex-row">
							{Object.entries(tabs).map(([key, tab]) => (
								<TabsTrigger
									key={key}
									value={key}
									className="flex-1"
								>
									<Text>{tab.label}</Text>
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</View>
			</WebWrapper>
			<KeyboardAvoidingScrollView>
				<WebWrapper>
					<View className="gap-2 p-4">
						{isLoading || isLoadingProfiles ? (
							<View className="flex items-center justify-center pt-40">
								<ActivityIndicator
									size="large"
									color={THEME["star-orange"]}
								/>
							</View>
						) : (
							<>
								{tab.value !== "profiles"
									? music?.songs.map((song) => (
											<ResourceItem
												key={song.id}
												resource={{
													parentId: String(
														song.album.id,
													),
													resourceId: String(song.id),
													category: "SONG" as const,
												}}
												onPress={() => {
													// addRecent({
													// 	id: String(song.id),
													// 	type: "SONG",
													// 	data: song,
													// });
												}}
												textClassName="font-medium w-80"
												imageWidthAndHeight={80}
												showType
											/>
										))
									: null}
								{tab.value !== "profiles"
									? music?.albums.map((album) => (
											<ResourceItem
												key={album.id}
												resource={{
													parentId: String(
														album.artist?.id,
													),
													resourceId: String(
														album.id,
													),
													category: "ALBUM" as const,
												}}
												onPress={() => {
													// addRecent({
													// 	id: String(album.id),
													// 	type: "ALBUM",
													// 	data: album,
													// });
												}}
												textClassName="font-medium w-80"
												imageWidthAndHeight={80}
												showType
											/>
										))
									: null}
								{tab.value !== "profiles"
									? music?.artists.map((artist) => (
											<ArtistItem
												key={artist.id}
												artistId={String(artist.id)}
												initialArtist={artist}
												onPress={() => {
													// addRecent({
													// 	id: String(artist.id),
													// 	type: "ARTIST",
													// 	data: artist,
													// });
												}}
												textClassName="font-medium w-80"
												imageWidthAndHeight={80}
												showType
											/>
										))
									: null}
								{tab.value === "profiles" || tab.value === "all"
									? profiles?.items.map((profile, index) => {
											if (
												profile.deactivated &&
												userProfile?.role != "MOD"
											)
												return null;
											return (
												<ProfileItem
													profile={profile}
													key={index}
													size={80}
													onPress={() => {
														// addRecent({
														// 	id: profile.userId,
														// 	type: "PROFILE",
														// 	data: profile,
														// });
													}}
													showType={
														tab.value === "all"
													}
													isUser
												/>
											);
										})
									: null}
							</>
						)}
					</View>
				</WebWrapper>
			</KeyboardAvoidingScrollView>
		</Page>
	);
}

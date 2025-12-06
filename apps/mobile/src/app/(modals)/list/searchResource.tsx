import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { deezerHelpers } from "@/lib/deezer";
import { Search } from "@/lib/icons/IconsLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import { Album, Artist, Track, useDebounce } from "@recordscratch/lib";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const MusicSearch = ({
	query,
	category,
	onPress,
}: {
	query: string;
	category: "ALBUM" | "SONG" | "ARTIST";
	onPress: (resource: Artist | Album | Track) => void;
}) => {
	const { data: music, isLoading } = useQuery({
		queryKey: ["search", query, category],
		queryFn: async () => {
			return await deezerHelpers.search({
				query: query,
				filters: {
					albums: category === "ALBUM",
					artists: category === "ARTIST",
					songs: category === "SONG",
				},
				limit: 8,
			});
		},
		enabled: query.length > 0,
	});

	if (isLoading) {
		return (
			<View className="flex flex-1 items-center justify-center pt-40">
				<ActivityIndicator size="large" color="#ff8500" />
			</View>
		);
	}

	const renderItem = ({ item }: { item: Artist | Album | Track }) => {
		switch (category) {
			case "SONG":
				const song = item as Track;
				return (
					<ResourceItem
						key={song.id}
						resource={{
							parentId: String(song.album.id),
							resourceId: String(song.id),
							category: "SONG",
						}}
						onPress={() => {
							onPress(song);
						}}
						textClassName="font-medium w-80"
						showLink={false}
						imageWidthAndHeight={80}
					/>
				);
			case "ALBUM":
				const album = item as Album;
				return (
					<ResourceItem
						key={album.id}
						resource={{
							parentId: String(album.artist?.id),
							resourceId: String(album.id),
							category: "ALBUM",
						}}
						onPress={() => {
							onPress(album);
						}}
						textClassName="font-medium w-80"
						showLink={false}
						imageWidthAndHeight={80}
					/>
				);
			case "ARTIST":
				const artist = item as Artist;
				return (
					<ArtistItem
						key={artist.id}
						artistId={String(artist.id)}
						onPress={() => {
							onPress(artist);
						}}
						textClassName="font-medium w-80"
						showLink={false}
						imageWidthAndHeight={80}
					/>
				);
		}
	};

	return (
		<FlashList
			data={
				category === "SONG"
					? music?.songs
					: category === "ALBUM"
						? music?.albums
						: music?.artists
			}
			renderItem={renderItem}
			keyExtractor={(item) => item.id.toString()}
			ItemSeparatorComponent={() => <View className="h-3" />}
			contentContainerClassName="py-4"
			keyboardShouldPersistTaps="handled"
			estimatedItemSize={125}
		/>
	);
};

const RatingModal = () => {
	const router = useRouter();
	const { category, listId, isTopList } = useLocalSearchParams<{
		category: "ALBUM" | "SONG" | "ARTIST";
		listId: string;
		isTopList: "true" | "false";
	}>();
	const utils = api.useUtils();
	const myProfile = useAuth((s) => s.profile);

	const { control, watch } = useForm<{ query: string }>({
		resolver: zodResolver(z.object({ query: z.string().min(1) })),
		defaultValues: { query: "" },
	});

	const query = watch("query");
	const debouncedQuery = useDebounce(query, 500);

	const list = api.useUtils().lists.resources.get;
	const { mutate } = api.lists.resources.create.useMutation({
		onSettled: async (_data, _error, variables) => {
			if (variables) {
				await list.invalidate({
					listId: variables.listId,
				});
				if (isTopList === "true") {
					utils.lists.topLists.invalidate({
						userId: myProfile!.userId,
					});
				}
				utils.lists.getUser.invalidate({ userId: myProfile!.userId });
				router.back();
			}
		},
	});

	return (
		<SafeAreaView style={{ flex: 1 }} edges={["left", "right", "top"]}>
			<Stack.Screen
				options={{
					title: `Search for an ${category.toLowerCase()}`,
				}}
			/>
			<KeyboardAvoidingScrollView modal>
				<WebWrapper>
					<View className="p-4">
						<View className="flex-row items-center">
							<View className="h-14 flex-1 flex-row items-center rounded-xl border border-border pr-4">
								<Search size={20} className="mx-4 text-foreground" />
								<Controller
									control={control}
									name="query"
									render={({ field: { onChange, value } }) => (
										<TextInput
											autoComplete="off"
											placeholder={`Search for a ${category.toLowerCase()}`}
											value={value}
											cursorColor={"#ffb703"}
											style={{
												paddingTop: 0,
												paddingBottom: Platform.OS === "ios" ? 4 : 0,
												textAlignVertical: "center",
											}}
											autoCorrect={false}
											autoFocus
											className="h-full w-full flex-1 p-0 text-xl text-foreground outline-none"
											onChangeText={(text) => onChange(text)}
											keyboardType="default"
										/>
									)}
								/>
							</View>
						</View>
						<MusicSearch
							query={debouncedQuery}
							category={category}
							onPress={(resource: Artist | Album | Track) => {
								mutate({
									resourceId: String(resource.id),
									parentId:
										"album" in resource
											? String(resource.album?.id)
											: "artist" in resource
												? String(resource.artist?.id)
												: null,
									listId,
								});
							}}
						/>
					</View>
				</WebWrapper>
			</KeyboardAvoidingScrollView>
		</SafeAreaView>
	);
};

export default RatingModal;

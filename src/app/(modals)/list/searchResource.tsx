import { ArtistItem } from "@/components/Item/ArtistItem";
import { ResourceItem } from "@/components/Item/ResourceItem";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { useAuth } from "@/lib/auth";
import { deezerHelpers } from "@/lib/deezer";
import { Search } from "@/lib/icons/IconsLoader";
import { Album, Artist, Track, useDebounce } from "@/lib";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Platform, TextInput, View } from "react-native";
import { z } from "zod";
import { useForm, useStore } from "@tanstack/react-form";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";
import { useCSSVariable } from "uniwind";

const MusicSearch = ({
	query,
	category,
	onPress,
}: {
	query: string;
	category: "ALBUM" | "SONG" | "ARTIST";
	onPress: (resource: Artist | Album | Track) => void;
}) => {
	const starOrangeColor = useCSSVariable("--color-star-orange") as string;
	const { data: music, isLoading } = useQuery({
		queryKey: ["search", query, category],
		queryFn: async () => {
			return await deezerHelpers().search({
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
				<ActivityIndicator size="large" color={starOrangeColor} />
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
	const myProfile = useAuth((s) => s.profile);
	const queryClient = useQueryClient();

	const form = useForm({
		validators: {
			onSubmit: z.object({ query: z.string().min(1) }),
		},
		defaultValues: { query: "" },
	});

	const query = useStore(form.store, (state) => state.values.query);
	const debouncedQuery = useDebounce(query, 500);

	const { mutate } = useMutation(
		api.lists.resources.create.mutationOptions({
			onSettled: async (_data, _error, variables) => {
				if (variables) {
					await Promise.all([
						queryClient.invalidateQueries(
							api.lists.resources.get.queryOptions({
								userId: myProfile!.userId,
								listId: variables.listId,
							}),
						),
						isTopList === "true" &&
							queryClient.invalidateQueries(
								api.lists.topLists.queryOptions({
									userId: myProfile!.userId,
								}),
							),
						queryClient.invalidateQueries(
							api.lists.getUser.queryOptions({
								userId: myProfile!.userId,
							}),
						),
					]);
					router.back();
				}
			},
		}),
	);

	return (
		<Page title={`Search for an ${category.toLowerCase()}`}>
			<KeyboardAvoidingScrollView modal>
				<WebWrapper>
					<View className="p-4">
						<View className="flex-row items-center">
							<View className="border-border h-14 flex-1 flex-row items-center rounded-xl border pr-4">
								<Search
									size={20}
									className="text-foreground mx-4"
								/>
								<form.Field
									name="query"
									children={(field) => (
										<TextInput
											autoComplete="off"
											placeholder={`Search for a ${category.toLowerCase()}`}
											value={field.state.value}
											cursorColor={"#ffb703"}
											style={{
												paddingTop: 0,
												paddingBottom:
													Platform.OS === "ios"
														? 4
														: 0,
												textAlignVertical: "center",
											}}
											autoCorrect={false}
											autoFocus
											className="text-foreground h-full w-full flex-1 p-0 text-xl outline-none"
											onChangeText={field.handleChange}
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
												: undefined,
									listId,
								});
							}}
						/>
					</View>
				</WebWrapper>
			</KeyboardAvoidingScrollView>
		</Page>
	);
};

export default RatingModal;

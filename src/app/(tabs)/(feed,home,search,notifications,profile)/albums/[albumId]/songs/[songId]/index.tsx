import NotFoundScreen from "@/app/+not-found";
import StatBlock from "@/components/CoreComponents/StatBlock";
import AddToListButton from "@/components/List/AddToListButton";
import Metadata from "@/components/Metadata";
import RateButton from "@/components/Rating/RateButton";
import { RatingInfo } from "@/components/Rating/RatingInfo";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { getQueryOptions } from "@/lib/deezer";
import { formatDuration } from "@/lib";
import { Resource } from "@/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { Page } from "@/components/Page";
import { headerRight } from "@/lib/navigation";

const SongPage = () => {
	const router = useRouter();
	const { albumId, songId } = useLocalSearchParams<{
		albumId: string;
		songId: string;
	}>();

	const { data: rating } = useSuspenseQuery(
		api.ratings.get.queryOptions({
			resourceId: songId,
			category: "SONG",
		}),
	);

	const { data: album } = useSuspenseQuery(
		getQueryOptions({
			route: "/album/{id}",
			input: { id: albumId! },
		}),
	);

	const { data: song } = useSuspenseQuery(
		getQueryOptions({
			route: "/track/{id}",
			input: { id: songId! },
		}),
	);

	if (!album || !song) return <NotFoundScreen />;

	const resource: Resource = {
		parentId: String(albumId),
		resourceId: String(songId),
		category: "SONG",
	};

	return (
		<Page
			title={song.title}
			options={headerRight({
				type: "button",
				label: "Go to album",
				onPress: () => router.push(`/albums/${album.id}`),
			})}
		>
			<View className="flex flex-1">
				<ScrollView>
					<WebWrapper>
						<Metadata
							title={song.title}
							cover={album.cover_big}
							type="SONG"
							tags={[
								album.release_date,
								song.explicit_lyrics ? "Explicit" : undefined,
								formatDuration(song.duration),
							]}
						>
							<View className="flex w-auto flex-col sm:max-w-72">
								<View className="my-4 flex-row items-center justify-center gap-4 sm:justify-start">
									<RatingInfo resource={resource} />
									<RateButton
										imageUrl={album.cover_big}
										resource={resource}
										name={song.title}
									/>
									<AddToListButton
										resourceId={String(song.id)}
										parentId={String(song.album.id)}
										category="SONG"
									/>
									<Link href={`/albums/${album.id}`} asChild>
										<Button
											variant="secondary"
											size={"sm"}
											className="hidden sm:flex"
										>
											<Text>Go to album</Text>
										</Button>
									</Link>
								</View>
								<Link
									href={`/albums/${album.id}/songs/${song.id}/reviews`}
									asChild
									style={{ width: "100%" }}
								>
									<Pressable>
										<StatBlock
											title="Ratings"
											description={rating?.total ?? 0}
										/>
									</Pressable>
								</Link>
							</View>
						</Metadata>
					</WebWrapper>
				</ScrollView>
			</View>
		</Page>
	);
};

export default SongPage;

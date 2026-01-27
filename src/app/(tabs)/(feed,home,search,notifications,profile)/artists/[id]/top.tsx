import SongTable from "@/components/SongTable";
import { WebWrapper } from "@/components/WebWrapper";
import { getQueryOptions } from "@/lib/deezer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Platform, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Page } from "@/components/Page";

const TopPage = () => {
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
				limit: 50,
			},
		}),
	);

	return (
		<Page title={`${artist.name}'s Top Songs`}>
			{Platform.OS === "web" && (
				<Text variant="h3" className="pb-4 text-center">
					{artist.name}'s Top Songs
				</Text>
			)}
			<ScrollView className="flex flex-1">
				<WebWrapper>
					<SongTable songs={top.data} />
				</WebWrapper>
			</ScrollView>
		</Page>
	);
};
export default TopPage;

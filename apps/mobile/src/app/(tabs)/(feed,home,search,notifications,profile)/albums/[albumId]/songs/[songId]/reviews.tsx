import DistributionChart from "@/components/DistributionChart";
import { ReviewsList } from "@/components/ReviewsList";
import { WebWrapper } from "@/components/WebWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { getQueryOptions } from "@/lib/deezer";
import { Resource } from "@recordscratch/types";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const tabs = ["everyone", "friends"];
const ratingTabs = ["REVIEW", "RATING", "all"];

const Reviews = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		albumId: string;
		songId: string;
		tab?: string;
		ratingTab?: string;
		ratingFilter?: string;
	}>();
	const { albumId, songId } = params;
	const tab = params.tab && tabs.includes(params.tab) ? params.tab : "everyone";
	const ratingTab = (
		params.ratingTab && ratingTabs.includes(params.ratingTab) ? params.ratingTab : "all"
	) as "REVIEW" | "RATING" | "all";
	const ratingFilter =
		params.ratingFilter && params.ratingFilter !== "undefined"
			? Number(params.ratingFilter)
			: undefined;

	const { data: song } = useSuspenseQuery(
		getQueryOptions({
			route: "/track/{id}",
			input: { id: songId! },
		})
	);

	const { data: values } = useQuery(
		api.ratings.distribution.queryOptions(
			{
				resourceId: songId,
				filters: {
					reviewType: ratingTab === "all" ? undefined : ratingTab,
					following: tab === "friends",
				},
			},
			{
				placeholderData: keepPreviousData,
			}
		)
	);

	useEffect(() => {
		if (values && ratingFilter && values[ratingFilter - 1] === 0) {
			router.setParams({
				ratingFilter: undefined,
			});
		}
	}, [values]);

	const resource: Resource = {
		parentId: String(albumId),
		resourceId: String(songId),
		category: "SONG",
	};

	return (
		<>
			<Stack.Screen
				options={{
					title:
						song.title.substring(0, 20) +
						(song.title.length > 20 ? "... Ratings" : " Ratings"),
				}}
			/>
			<ReviewsList
				filters={{
					following: tab === "friends",
					resourceId: resource.resourceId,
					category: resource.category,
					rating: ratingFilter,
					ratingType: ratingTab === "all" ? undefined : ratingTab,
				}}
				limit={20}
				ListHeaderComponent={
					<WebWrapper>
						<View className="max-w-[600px] gap-4 p-4">
							{Platform.OS === "web" && (
								<Text variant="h2" className="mb-4">
									{song.title + " Ratings"}
								</Text>
							)}
							<View className="rounded-xl border border-border px-2 pt-3">
								<DistributionChart
									distribution={values}
									height={Platform.OS === "web" ? 100 : 80}
									value={ratingFilter}
									onChange={(value) => {
										router.setParams({
											ratingFilter: value,
										});
									}}
								/>
							</View>
							<Tabs
								value={tab}
								onValueChange={(value) => {
									router.setParams({
										tab: value === "everyone" ? undefined : value,
									});
								}}>
								<TabsList className="w-full flex-row">
									<TabsTrigger value="everyone" className="flex-1">
										<Text>All</Text>
									</TabsTrigger>
									<TabsTrigger value="friends" className="flex-1">
										<Text>Following</Text>
									</TabsTrigger>
								</TabsList>
							</Tabs>
							<Tabs
								value={ratingTab}
								onValueChange={(value) => {
									if (value === "all") {
										router.setParams({
											ratingTab: undefined,
										});
									} else {
										router.setParams({ ratingTab: value });
									}
								}}>
								<TabsList className="w-full flex-row">
									<TabsTrigger value="all" className="flex-1">
										<Text>All</Text>
									</TabsTrigger>
									<TabsTrigger value="REVIEW" className="flex-1">
										<Text>Reviews</Text>
									</TabsTrigger>
									<TabsTrigger value="RATING" className="flex-1">
										<Text>Ratings</Text>
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</View>
					</WebWrapper>
				}
			/>
		</>
	);
};

export default Reviews;

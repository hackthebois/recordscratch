import DistributionChart from "@/components/DistributionChart";
import { ReviewsList } from "@/components/ReviewsList";
import { WebWrapper } from "@/components/WebWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { getQueryOptions } from "@/lib/deezer";
import { Resource } from "@recordscratch/types";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";

const tabs = ["everyone", "friends"];
const ratingTabs = ["all", "REVIEW", "RATING"];

const Reviews = () => {
	const router = useRouter();
	const params = useLocalSearchParams<{
		albumId: string;
		tab?: string;
		ratingTab?: string;
		ratingFilter?: string;
	}>();
	const { albumId } = params;
	const tab = params.tab && tabs.includes(params.tab) ? params.tab : "everyone";
	const ratingTab = (
		params.ratingTab && ratingTabs.includes(params.ratingTab) ? params.ratingTab : "all"
	) as "REVIEW" | "RATING" | "all";
	const ratingFilter =
		params.ratingFilter && params.ratingFilter !== "undefined"
			? Number(params.ratingFilter)
			: undefined;

	const id = albumId!;

	const { data: album } = useSuspenseQuery(
		getQueryOptions({
			route: "/album/{id}",
			input: { id },
		})
	);

	const { data: values } = api.ratings.distribution.useQuery(
		{
			resourceId: albumId,
			filters: {
				reviewType: ratingTab === "all" ? undefined : ratingTab,
				following: tab === "friends",
			},
		},
		{
			placeholderData: keepPreviousData,
		}
	);

	useEffect(() => {
		if (values && ratingFilter && values[ratingFilter - 1] === 0) {
			router.setParams({
				ratingFilter: undefined,
			});
		}
	}, [values]);

	const resource: Resource = {
		parentId: String(album.artist?.id),
		resourceId: String(album.id),
		category: "ALBUM",
	};

	return (
		<View className="flex-1">
			<Stack.Screen
				options={{
					title:
						album.title.substring(0, 20) +
						(album.title.length > 20 ? "... Ratings" : " Ratings"),
				}}
			/>

			<ReviewsList
				filters={{
					following: tab === "friends",
					resourceId: resource.resourceId,
					category: resource.category,
					ratingType: ratingTab === "all" ? undefined : ratingTab,
					rating: ratingFilter,
				}}
				ListHeaderComponent={
					<WebWrapper>
						<View className="max-w-[600px] gap-4 p-4">
							{Platform.OS === "web" && (
								<Text variant="h2" className="mb-4">
									{album.title + " Ratings"}
								</Text>
							)}
							<View className="rounded-xl border border-border px-2 pt-3">
								<DistributionChart
									distribution={values}
									value={ratingFilter}
									onChange={(value) => {
										router.setParams({
											ratingFilter: value,
										});
									}}
									height={Platform.OS === "web" ? 100 : 80}
								/>
							</View>
							<Tabs
								value={tab}
								onValueChange={(tab) =>
									router.setParams({
										tab: tab === "everyone" ? undefined : tab,
									})
								}>
								<View className="flex items-center">
									<TabsList className="w-full flex-row">
										<TabsTrigger value="everyone" className="flex-1">
											<Text>All</Text>
										</TabsTrigger>
										<TabsTrigger value="friends" className="flex-1">
											<Text>Following</Text>
										</TabsTrigger>
									</TabsList>
								</View>
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
								<View className="flex items-center sm:items-start">
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
								</View>
							</Tabs>
						</View>
					</WebWrapper>
				}
			/>
		</View>
	);
};

export default Reviews;

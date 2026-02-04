import { useRefreshByUser } from "@/lib/refresh";
import { RouterInputs } from "@/server/api";
import { ReviewType } from "@/types";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Review } from "./Review";
import { Text } from "./ui/text";
import { WebWrapper } from "./WebWrapper";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { THEME } from "@/lib/constants";

export const ReviewsList = (
	input: RouterInputs["ratings"]["feed"] & {
		ListHeaderComponent?: FlashListProps<ReviewType>["ListHeaderComponent"];
		emptyText?: string;
	},
) => {
	const { ListHeaderComponent, emptyText, ...queryInput } = input;
	const { data, fetchNextPage, hasNextPage, refetch, isLoading } =
		useInfiniteQuery(
			api.ratings.feed.infiniteQueryOptions(queryInput, {
				getNextPageParam: (lastPage: { nextCursor: any }) =>
					lastPage.nextCursor,
			}),
		);

	const { refetchByUser, isRefetchingByUser } = useRefreshByUser(refetch);

	return (
		<FlashList
			ListHeaderComponent={ListHeaderComponent}
			data={
				data?.pages?.flatMap((page) => page.items).length === 0
					? undefined
					: data?.pages?.flatMap((page) => page.items)
			}
			keyExtractor={(item, index) => `review-${item.userId}-${index}`}
			ItemSeparatorComponent={() => (
				<WebWrapper>
					<View className="bg-muted h-px" />
				</WebWrapper>
			)}
			renderItem={({ item }) => (
				<Review
					{...item}
					content={item.content ?? ""}
					feedInput={queryInput}
				/>
			)}
			ListFooterComponent={() =>
				hasNextPage ? (
					<ActivityIndicator
						size="large"
						color={THEME["star-orange"]}
					/>
				) : null
			}
			ListEmptyComponent={
				<View className="px-4 pt-40">
					{isLoading ? (
						<ActivityIndicator
							size="large"
							color={THEME["star-orange"]}
						/>
					) : (
						<Text
							variant="h3"
							className="text-muted-foreground text-center"
						>
							{emptyText ? emptyText : "No reviews found"}
						</Text>
					)}
				</View>
			}
			scrollEnabled={true}
			onEndReachedThreshold={0.1}
			onEndReached={() => {
				if (hasNextPage) {
					fetchNextPage();
				}
			}}
			refreshing={isRefetchingByUser}
			onRefresh={refetchByUser}
		/>
	);
};

import NotFoundScreen from "@/app/+not-found";
import { Comment } from "@/components/Comment";
import { WebWrapper } from "@/components/WebWrapper";
import { useRefreshByUser } from "@/lib/refresh";
import { FlashList } from "@shopify/flash-list";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CommentPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();

	const { data: comment, refetch } = useSuspenseQuery(
		api.comments.get.queryOptions({
			id,
		})
	);

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

	if (!comment) return <NotFoundScreen />;

	return (
		<>
			<Stack.Screen
				options={{
					title: `${comment.profile.name}'s Comment`,
				}}
			/>
			<View className="flex-1">
				<FlashList
					ListHeaderComponent={
						<WebWrapper>
							<Comment comment={comment} />
							<View className="h-[1px] bg-muted" />
						</WebWrapper>
					}
					data={comment.replies}
					renderItem={({ item }) => (
						<WebWrapper>
							<Comment comment={item} />
						</WebWrapper>
					)}
					ItemSeparatorComponent={() => (
						<WebWrapper>
							<View className="h-[1px] bg-muted" />
						</WebWrapper>
					)}
					refreshing={isRefetchingByUser}
					onRefresh={refetchByUser}
					contentContainerClassName="p-4"
				/>
			</View>
		</>
	);
};
export default CommentPage;

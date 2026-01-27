import NotFoundScreen from "@/app/+not-found";
import { Comment } from "@/components/Comment";
import { WebWrapper } from "@/components/WebWrapper";
import { useRefreshByUser } from "@/lib/refresh";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Page } from "@/components/Page";

const CommentPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();

	const { data: comment, refetch } = useSuspenseQuery(
		api.comments.get.queryOptions({
			id,
		}),
	);

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

	if (!comment) return <NotFoundScreen />;

	return (
		<Page title={`${comment.profile.name}'s Comment`}>
			<FlashList
				ListHeaderComponent={
					<WebWrapper>
						<Comment comment={comment} />
						<View className="bg-muted h-px" />
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
						<View className="bg-muted h-px" />
					</WebWrapper>
				)}
				refreshing={isRefetchingByUser}
				onRefresh={refetchByUser}
				contentContainerClassName="p-4"
			/>
		</Page>
	);
};
export default CommentPage;

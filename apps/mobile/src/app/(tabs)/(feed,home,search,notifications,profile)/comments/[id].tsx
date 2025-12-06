import NotFoundScreen from "@/app/+not-found";
import { Comment } from "@/components/Comment";
import { WebWrapper } from "@/components/WebWrapper";
import { api } from "@/components/Providers";
import { useRefreshByUser } from "@/lib/refresh";
import { FlashList } from "@shopify/flash-list";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const CommentPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();

	const [comment, { refetch }] = api.comments.get.useSuspenseQuery({
		id,
	});

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
					estimatedItemSize={200}
					refreshing={isRefetchingByUser}
					onRefresh={refetchByUser}
					contentContainerClassName="p-4"
				/>
			</View>
		</>
	);
};
export default CommentPage;

import NotFoundScreen from "@/app/+not-found";
import { Comment } from "@/components/Comment";
import { Review } from "@/components/Review";
import { WebWrapper } from "@/components/WebWrapper";
import { api } from "@/components/Providers";
import { useRefreshByUser } from "@/lib/refresh";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, SectionList, View } from "react-native";
import { cn } from "@recordscratch/lib";
import { CommentAndProfile } from "@recordscratch/types";

const RatingPage = () => {
	const { id, handle } = useLocalSearchParams<{
		id: string;
		handle: string;
	}>();

	const [profile] = api.profiles.get.useSuspenseQuery(handle!);

	const [rating] = api.ratings.user.get.useSuspenseQuery({
		userId: profile!.userId,
		resourceId: id!,
	});
	const [comments, { refetch }] = api.comments.list.useSuspenseQuery({
		resourceId: id!,
		authorId: profile!.userId,
	});

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

	const [expandedSections, setExpandedSections] = useState(new Set<string>());

	const handleToggle = useCallback((id: string) => {
		setExpandedSections((expandedSections) => {
			const next = new Set(expandedSections);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const [sections, setSections] = useState<
		Array<CommentAndProfile & { data: CommentAndProfile[] }>
	>([]);

	useEffect(() => {
		setSections(
			comments.map(({ allreplies, ...rest }) => ({
				...rest,
				data: allreplies,
			}))
		);
	}, [comments]);

	if (!profile || !rating) return <NotFoundScreen />;

	return (
		<>
			<Stack.Screen
				options={{
					title: `${profile.name}'s Rating`,
				}}
			/>
			<ScrollView>
				<WebWrapper>
					<SectionList
						scrollEnabled={false}
						ListHeaderComponent={
							<>
								<Review {...rating} profile={profile} />
								<View className="h-[1px] bg-muted" />
							</>
						}
						extraData={expandedSections}
						sections={sections}
						keyExtractor={(item) => item.id}
						renderItem={({ section: { id }, item }) => {
							const hidden = !expandedSections.has(id);
							return (
								<View className={cn("ml-10", hidden && "hidden")}>
									<Comment comment={item} />
								</View>
							);
						}}
						renderSectionHeader={({ section }) => (
							<Comment
								comment={section}
								onCommentPress={() => handleToggle(section.id)}
							/>
						)}
						refreshing={isRefetchingByUser}
						onRefresh={refetchByUser}
					/>
				</WebWrapper>
			</ScrollView>
		</>
	);
};
export default RatingPage;

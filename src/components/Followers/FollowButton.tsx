import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export const useFollowButton = (profileId: string) => {
	const { data: isFollowing } = useSuspenseQuery(
		api.profiles.isFollowing.queryOptions(profileId),
	);
	const queryClient = useQueryClient();

	const invalidate = () =>
		Promise.all([
			queryClient.invalidateQueries(
				api.profiles.isFollowing.queryOptions(profileId),
			),
			queryClient.invalidateQueries(
				api.profiles.get.queryOptions(profileId),
			),

			// Invalidate profiles followers
			queryClient.invalidateQueries(
				api.profiles.followProfiles.queryOptions({
					profileId,
					type: "followers",
				}),
			),

			// Invalidate user following
			queryClient.invalidateQueries(
				api.profiles.followProfiles.queryOptions({
					profileId,
					type: "following",
				}),
			),
		]);

	const { mutate: followUser, isPending: isFollow } = useMutation(
		api.profiles.follow.mutationOptions({
			onSettled: () => invalidate(),
		}),
	);
	const { mutate: unFollowUser, isPending: isUnFollow } = useMutation(
		api.profiles.unFollow.mutationOptions({
			onSettled: () => invalidate(),
		}),
	);

	const following = isFollow ? true : isUnFollow ? false : isFollowing;

	return {
		label: following ? "Unfollow" : "Follow",
		onPress: () => {
			if (isFollow || isUnFollow) return;
			if (following) unFollowUser(profileId);
			else followUser(profileId);
		},
	};
};

export const FollowButton = ({
	profileId,
	size = "default",
}: {
	profileId: string;
	size?: "sm" | "default";
}) => {
	const { label, onPress } = useFollowButton(profileId);

	return (
		<Button
			variant={"secondary"}
			size={size}
			onPress={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onPress();
			}}
		>
			<Text>{label}</Text>
		</Button>
	);
};

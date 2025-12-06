import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";

export const FollowButton = ({
	profileId,
	size = "default",
}: {
	profileId: string;
	size?: "sm" | "default";
}) => {
	const utils = api.useUtils();
	const profile = useAuth((s) => s.profile);
	const [isFollowing] = api.profiles.isFollowing.useSuspenseQuery(profileId);

	const revalidate = async () => {
		await utils.profiles.isFollowing.invalidate(profileId);

		// Invalidate profiles followers
		utils.profiles.followCount.invalidate({
			profileId: profileId,
			type: "followers",
		});
		utils.profiles.followProfiles.invalidate({
			profileId,
			type: "followers",
		});

		// Invalidate user following
		utils.profiles.followCount.invalidate({
			profileId: profile!.userId!,
			type: "following",
		});
		utils.profiles.followProfiles.invalidate({
			profileId: profile!.userId!,
			type: "following",
		});
	};

	const { mutate: followUser, isPending: isFollow } = api.profiles.follow.useMutation({
		onSettled: async () => {
			await revalidate();
		},
	});
	const { mutate: unFollowUser, isPending: isUnFollow } = api.profiles.unFollow.useMutation({
		onSettled: async () => {
			await revalidate();
		},
	});

	const following = isFollow ? true : isUnFollow ? false : isFollowing;

	return (
		<Button
			variant={"secondary"}
			size={size}
			onPress={(e) => {
				e.stopPropagation();
				e.preventDefault();
				if (isFollow || isUnFollow) return;
				if (following) unFollowUser(profileId);
				else followUser(profileId);
			}}>
			<Text>{following ? "Unfollow" : "Follow"}</Text>
		</Button>
	);
};

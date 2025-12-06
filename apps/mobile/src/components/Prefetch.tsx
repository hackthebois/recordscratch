import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";

export const Prefetch = ({ handle, userId }: { handle: string; userId: string }) => {
	api.profiles.get.usePrefetchQuery(handle);
	api.ratings.user.streak.usePrefetchQuery({ userId });
	api.ratings.user.totalLikes.usePrefetchQuery({ userId });
	api.profiles.distribution.usePrefetchQuery({ userId });
	api.lists.topLists.usePrefetchQuery({ userId });
	api.profiles.getTotalRatings.usePrefetchQuery({ userId });
	api.profiles.followCount.usePrefetchQuery({
		profileId: userId,
		type: "followers",
	});
	api.profiles.followCount.usePrefetchQuery({
		profileId: userId,
		type: "following",
	});
	api.ratings.trending.usePrefetchQuery();
	api.ratings.top.usePrefetchQuery();
	api.ratings.popular.usePrefetchQuery();
	api.ratings.topArtists.usePrefetchQuery();

	return null;
};

export const PrefetchProfile = (props: { handle?: string; userId?: string }) => {
	const profile = useAuth((s) => s.profile);
	const handle = props.handle ?? profile?.handle ?? "";
	const userId = props.userId ?? profile?.userId ?? "";

	if (handle && userId) {
		return <Prefetch handle={handle} userId={userId} />;
	}

	return null;
};

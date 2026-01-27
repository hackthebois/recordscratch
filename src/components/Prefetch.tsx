import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usePrefetchQuery } from "@tanstack/react-query";

export const Prefetch = ({ handle, userId }: { handle: string; userId: string }) => {
	usePrefetchQuery(api.profiles.get.queryOptions(handle));
	usePrefetchQuery(api.profiles.distribution.queryOptions({ userId }));
	usePrefetchQuery(api.lists.topLists.queryOptions({ userId }));
	usePrefetchQuery(api.ratings.charts.queryOptions());

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

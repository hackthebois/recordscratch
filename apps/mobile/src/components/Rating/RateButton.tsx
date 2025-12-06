import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { Star } from "@/lib/icons/IconsLoader";
import { Rating, Resource } from "@recordscratch/types";
import { Link } from "expo-router";
import React from "react";
import { Button } from "../ui/button";

const iconSize = {
	lg: 27,
	default: 24,
	sm: 21,
};

const RateButton = ({
	initialUserRating,
	resource,
	imageUrl,
	name,
	size = "default",
}: {
	initialUserRating?: Rating | null;
	resource: Resource;
	imageUrl?: string | null | undefined;
	name?: string;
	size?: "lg" | "default" | "sm";
}) => {
	const userId = useAuth((s) => s.profile!.userId);
	const { data: userRating, isLoading } = api.ratings.user.get.useQuery(
		{ resourceId: resource.resourceId, userId },
		{
			staleTime: Infinity,
			initialData: initialUserRating,
		}
	);

	if (isLoading) {
		return <Skeleton className="h-[48px] w-[80px]" />;
	}

	const fill = userRating ? { fill: "#fb8500" } : undefined;

	return (
		<Link
			href={{
				pathname: "(modals)/rating",
				params: {
					...resource,
					imageUrl,
					name,
				},
			}}
			asChild>
			<Button variant="secondary" size={size} className="flex-row gap-2">
				<Star size={iconSize[size]} color="#fb8500" {...fill} />
				<Text>{userRating ? userRating.rating : "Rate"}</Text>
			</Button>
		</Link>
	);
};

export default RateButton;

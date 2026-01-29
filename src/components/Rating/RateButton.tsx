import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { Star } from "@/lib/icons/IconsLoader";
import { Rating, Resource } from "@/types";
import { Link } from "expo-router";
import React from "react";
import { Button, buttonSizes } from "../ui/button";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { View } from "react-native";
import { THEME } from "@/lib/constants";

const iconSize = {
	lg: 27,
	default: 24,
	sm: 21,
};

const width = {
	sm: 81,
	default: 98,
	lg: 100,
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
	const { data: userRating, isLoading } = useQuery(
		api.ratings.user.get.queryOptions(
			{ resourceId: resource.resourceId, userId },
			{
				staleTime: Infinity,
				initialData: initialUserRating,
			},
		),
	);

	if (isLoading) {
		return (
			<Skeleton>
				<View
					className={buttonSizes[size]}
					style={{ width: width[size] }}
				/>
			</Skeleton>
		);
	}

	return (
		<Link
			href={{
				pathname: "/(modals)/rating",
				params: {
					...resource,
					imageUrl,
					name,
				},
			}}
			asChild
		>
			<Button variant="secondary" size={size} className="flex-row gap-2">
				<Star
					size={iconSize[size]}
					color={THEME.star}
					fill={userRating ? THEME["star-orange"] : undefined}
				/>
				<Text>{userRating ? userRating.rating : "Rate"}</Text>
			</Button>
		</Link>
	);
};

export default RateButton;

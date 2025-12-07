import { Text } from "@/components/ui/text";
import { Star } from "@/lib/icons/IconsLoader";
import { Resource } from "@recordscratch/types";
import { Link } from "expo-router";
import React from "react";
import { Button } from "../ui/button";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { ratingCollection } from "@/lib/collections/ratings";

const iconSize = {
	lg: 27,
	default: 24,
	sm: 21,
};

const RateButton = ({
	resource,
	imageUrl,
	name,
	size = "default",
}: {
	resource: Resource;
	imageUrl?: string | null | undefined;
	name?: string;
	size?: "lg" | "default" | "sm";
}) => {
	const { data } = useLiveQuery((q) =>
		q
			.from({
				rating: ratingCollection,
			})
			.where(({ rating }) => eq(rating.resourceId, resource.resourceId))
			.orderBy(({ rating }) => rating.rating)
			.limit(1)
	);
	const rating = data[0];

	const fill = rating ? { fill: "#fb8500" } : undefined;

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
			asChild>
			<Button variant="secondary" size={size} className="flex-row gap-2">
				<Star size={iconSize[size]} color="#fb8500" {...fill} />
				<Text>{rating ? rating.rating : "Rate"}</Text>
			</Button>
		</Link>
	);
};

export default RateButton;

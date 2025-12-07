import { Text } from "@/components/ui/text";
import { Star } from "@/lib/icons/IconsLoader";
import { cn } from "@recordscratch/lib";
import { Resource } from "@recordscratch/types";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { resourceRatingCollection } from "@/lib/collections/ratings";
import { eq, useLiveQuery } from "@tanstack/react-db";

export const RatingInfo = ({
	resource,
	size = "lg",
}: {
	resource: Resource;
	size?: "lg" | "sm";
}) => {
	const { data: resourceRating } = useLiveQuery((q) =>
		q
			.from({
				resourceRating: resourceRatingCollection,
			})
			.where(({ resourceRating }) => eq(resourceRating.resourceId, resource.resourceId))
			.findOne()
	);

	const href =
		resource.category === "ALBUM"
			? `/albums/${resource.resourceId}/reviews`
			: resource.category === "SONG"
				? `/albums/${resource.parentId}/songs/${resource.resourceId}/reviews`
				: `/artists/${resource.resourceId}`;

	return (
		<Link href={href as any} asChild>
			<Pressable
				className={cn(
					"flex min-h-12 justify-center gap-4",
					size === "sm" && "min-w-18 h-8",
					size === "lg" && "h-12 min-w-20"
				)}>
				{!(size === "sm" && !resourceRating?.average) && (
					<View className="flex flex-row items-center justify-center gap-2">
						<Star size={size === "lg" ? 32 : 21} color="#ffb703" fill="#ffb703" />
						<View className="flex flex-col">
							{resourceRating?.average && (
								<Text
									className={cn({
										"font-semibold text-lg": size === "lg",
										"text font-semibold": size === "sm",
									})}>
									{Number(resourceRating.average).toFixed(1)}
								</Text>
							)}
							{size === "lg" && (
								<Text className="text-lg text-muted-foreground">
									{resourceRating?.total && Number(resourceRating.total) !== 0
										? resourceRating.total
										: resource.category === "ARTIST"
											? "No ratings yet"
											: "Be first to rate"}
								</Text>
							)}
						</View>
					</View>
				)}
			</Pressable>
		</Link>
	);
};

import { Text } from "@/components/ui/text";
import { Star } from "@/lib/icons/IconsLoader";
import { cn } from "@recordscratch/lib";
import { Resource, ResourceRating } from "@recordscratch/types";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import { Skeleton } from "../ui/skeleton";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const RatingInfo = ({
	initialRating,
	resource,
	size = "lg",
}: {
	initialRating?: ResourceRating | null;
	resource: Resource;
	size?: "lg" | "sm";
}) => {
	const { data: rating, isLoading } = useQuery(
		api.ratings.get.queryOptions(resource, {
			initialData: initialRating,
			staleTime: Infinity,
		})
	);

	if (isLoading)
		return (
			<View
				className={cn(
					"flex min-h-12 justify-center gap-4",
					size === "sm" && "min-w-18 h-8",
					size === "lg" && "h-12 min-w-20"
				)}>
				<View className="flex flex-row items-center justify-center gap-2">
					<Star size={size === "lg" ? 32 : 21} color="#ffb703" />
					<View className="flex flex-col gap-1">
						<Skeleton className="w-6">
							<Text
								className={cn({
									"font-semibold text-lg": size === "lg",
									"text font-semibold": size === "sm",
								})}
							/>
						</Skeleton>
						{size === "lg" && (
							<Skeleton className="w-4">
								<Text className="text-lg text-muted-foreground" />
							</Skeleton>
						)}
					</View>
				</View>
			</View>
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
				{!(size === "sm" && !rating?.average) && (
					<View className="flex flex-row items-center justify-center gap-2">
						<Star size={size === "lg" ? 32 : 21} color="#ffb703" fill="#ffb703" />
						<View className="flex flex-col">
							{rating?.average && (
								<Text
									className={cn({
										"font-semibold text-lg": size === "lg",
										"text font-semibold": size === "sm",
									})}>
									{Number(rating.average).toFixed(1)}
								</Text>
							)}
							{size === "lg" && (
								<Text className="text-lg text-muted-foreground">
									{rating?.total && Number(rating.total) !== 0
										? rating.total
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

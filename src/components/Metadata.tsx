import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Genre } from "@/lib";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";

const Metadata = ({
	title,
	cover,
	type,
	tags,
	genres,
	children,
	size = "base",
}: {
	title?: string;
	cover?: string | React.ReactNode;
	type?: string;
	tags?: (string | undefined)[];
	genres?: Genre[];
	children: React.ReactNode;
	size?: "base" | "sm";
}) => {
	return (
		<View className="mt-4 flex flex-col gap-4 px-4 pb-4 sm:flex-row">
			{typeof cover === "string" ? (
				<View className="self-center overflow-hidden rounded-xl sm:self-start">
					<Image
						alt={`${title} cover`}
						source={cover}
						style={[
							size === "sm"
								? { width: 150, height: 150 }
								: {
										width: 200,
										height: 200,
									},
						]}
					/>
				</View>
			) : (
				<View className={"self-center sm:self-start"}>{cover}</View>
			)}
			<View className="flex flex-1 flex-col items-center justify-center gap-4 sm:items-start sm:justify-center">
				<View className="flex flex-col items-center justify-center gap-4 sm:items-start">
					{!!type && (
						<Text className="text-muted-foreground">
							{type.toUpperCase()}
						</Text>
					)}
					{title && (
						<Text variant="h1" className="text-center">
							{title}
						</Text>
					)}
					{tags && (
						<View className="flex flex-row flex-wrap justify-center gap-3 sm:justify-start">
							{tags
								.filter((tag) => Boolean(tag))
								.map((tag, index) => (
									<Badge key={index}>
										<Text>{tag}</Text>
									</Badge>
								))}

							{genres &&
								genres
									.filter((genre) => Boolean(genre))
									.map((genre) => (
										<Link
											href={`/genre/${genre.id}`}
											key={genre.id}
										>
											<Badge>
												<Text>{genre.name}</Text>
											</Badge>
										</Link>
									))}
						</View>
					)}
				</View>
				<View className="w-full">{children}</View>
			</View>
		</View>
	);
};

export default Metadata;

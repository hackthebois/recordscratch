import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { Star } from "@/lib/icons/IconsLoader";
import { RateForm, RateFormSchema, Resource } from "@/types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "@tanstack/react-form";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const RatingInput = ({
	value: rating,
	onChange,
}: {
	value: number | null;
	onChange: (_rating: number | null) => void;
}) => {
	return (
		<View className="flex flex-row justify-between">
			{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
				<Pressable
					key={index}
					onPress={() => {
						onChange(index);
					}}
					className="flex flex-row items-center justify-center pt-2"
				>
					<View className="flex flex-col items-center">
						{rating ? (
							index <= rating ? (
								<Star
									size={28}
									className="fill-star stroke-star"
								/>
							) : (
								<Star
									size={28}
									className="fill-background stroke-star"
								/>
							)
						) : (
							<Star
								size={28}
								className="fill-background stroke-star"
							/>
						)}
						<Text className="text-muted-foreground">{index}</Text>
					</View>
				</Pressable>
			))}
		</View>
	);
};

const RatingModal = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { imageUrl, name, ...resource } = useLocalSearchParams<{
		parentId: Resource["parentId"];
		resourceId: Resource["resourceId"];
		category: Resource["category"];
		imageUrl?: string;
		name?: string;
	}>();
	const userId = useAuth((s) => s.profile!.userId);

	const { data: userRating } = useQuery(
		api.ratings.user.get.queryOptions(
			{ resourceId: resource.resourceId, userId },
			{
				staleTime: Infinity,
			},
		),
	);

	const { mutate: rateMutation } = useMutation(
		api.ratings.rate.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries(
						api.ratings.user.get.queryOptions({
							resourceId: resource.resourceId,
							userId,
						}),
					),
					queryClient.invalidateQueries(
						api.ratings.get.queryOptions({
							resourceId: resource.resourceId,
							category: resource.category,
						}),
					),
					queryClient.invalidateQueries(
						api.profiles.distribution.queryOptions({
							userId,
						}),
					),
					queryClient.invalidateQueries(
						api.ratings.feed.queryOptions({
							filters: {
								profileId: userId,
							},
						}),
					),
				]);
				router.back();
			},
		}),
	);

	const form = useForm({
		validators: {
			onSubmit: RateFormSchema,
		},
		defaultValues: { ...resource, ...userRating } as RateForm,
		onSubmit: async ({ value }) => {
			rateMutation(value);
		},
	});

	const clearRating = () => {
		if (!userRating) return;
		rateMutation({
			...resource,
			content: null,
			rating: null,
		});
	};

	return (
		<SafeAreaView edges={["bottom"]} className="h-full">
			<Stack.Screen
				options={{
					title: `Rate ${resource.category === "ALBUM" ? "Album" : "Song"}`,
				}}
			/>
			<KeyboardAvoidingScrollView modal>
				<WebWrapper>
					<View className="gap-4 px-4 sm:mt-4 sm:px-0">
						{imageUrl ? (
							<Image
								alt={`cover`}
								source={{
									uri: imageUrl,
								}}
								style={[
									{
										alignSelf: "center",
										borderRadius: 12,
										width: 200,
										height: 200,
									},
								]}
							/>
						) : null}
						<View className="mt-4 gap-4">
							<Text variant="h1" className="text-center">
								{name}
							</Text>
							<Text className="text-center text-xl">
								{resource.category === "ALBUM"
									? "How would you rate this album?"
									: "How would you rate this song?"}
							</Text>
							<form.Field
								name="rating"
								children={(field) => (
									<RatingInput
										value={field.state.value ?? 0}
										onChange={field.handleChange}
									/>
								)}
							/>
							<form.Field
								name="content"
								children={(field) => (
									<TextInput
										onChangeText={field.handleChange}
										value={field.state.value ?? undefined}
										className="min-h-32 rounded-xl border border-border p-4 text-lg text-foreground"
										placeholder="Add review..."
										multiline
										scrollEnabled={false}
									/>
								)}
							/>
						</View>
						<View className="mt-4">
							<Button
								onPress={form.handleSubmit}
								disabled={!form.state.isValid}
								className="mb-4"
								variant="secondary"
							>
								<Text>Rate</Text>
							</Button>
							{userRating &&
								(userRating.content ? (
									<Pressable
										className="flex items-center"
										onPress={() =>
											Alert.alert(
												"Remove your review?",
												"This will remove your current review",
												[
													{
														text: "Cancel",
														style: "cancel",
													},
													{
														text: "Remove",
														onPress: () =>
															clearRating(),
													},
												],
											)
										}
									>
										<Text>Remove rating</Text>
									</Pressable>
								) : (
									<Pressable
										onPress={clearRating}
										className="flex items-center"
									>
										<Text>Remove rating</Text>
									</Pressable>
								))}
						</View>
					</View>
				</WebWrapper>
			</KeyboardAvoidingScrollView>
		</SafeAreaView>
	);
};

export default RatingModal;

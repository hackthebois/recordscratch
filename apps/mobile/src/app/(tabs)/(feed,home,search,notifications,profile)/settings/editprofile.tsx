import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { AtSign } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import {
	ListWithResources,
	UpdateProfileForm,
	UpdateProfileFormSchema,
} from "@recordscratch/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useForm, useStore } from "@tanstack/react-form";
import { TopListTab } from "@/components/List/TopList";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const EditProfile = () => {
	const { tab } = useLocalSearchParams<{ tab: string }>();
	const queryClient = useQueryClient();
	const profile = useAuth((s) => s.profile!);
	const { data: topLists } = useSuspenseQuery(
		api.lists.topLists.queryOptions({
			userId: profile!.userId,
		})
	);

	const setProfile = useAuth((s) => s.setProfile);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		validators: {
			onSubmit: UpdateProfileFormSchema,
		},
		defaultValues: {
			bio: profile.bio ?? undefined,
			image: {
				uri: getImageUrl(profile),
				type: "image/jpeg",
				size: 0,
			},
			name: profile.name,
			handle: profile.handle,
		} as UpdateProfileForm,
		onSubmit: async ({ value }) => {
			setLoading(true);
			if (value.image) {
				const url = await getSignedURL({
					type: value.image.type,
					size: value.image.size,
				});

				const response = await fetch(value.image.uri);
				const blob = await response.blob();

				await fetch(url, {
					method: "PUT",
					body: blob,
					headers: {
						"Content-Type": value.image.type,
					},
				});
			}

			updateProfile({
				bio: value.bio ?? null,
				name: value.name,
				handle: value.handle,
			});
			setLoading(false);
		},
	});

	const { mutate: updateProfile } = useMutation(
		api.profiles.update.mutationOptions({
			onSuccess: async (profile, { handle }) => {
				await Promise.all([
					queryClient.invalidateQueries(api.profiles.me.queryOptions()),
					queryClient.invalidateQueries(api.profiles.get.queryOptions(handle)),
				]);
				setProfile(profile);
				form.reset({
					bio: profile.bio ?? undefined,
					image: {
						uri: getImageUrl(profile),
						type: "image/jpeg",
						size: 0,
					},
					name: profile.name,
					handle: handle,
				});
			},
		})
	);
	const { mutateAsync: getSignedURL } = useMutation(api.profiles.getSignedURL.mutationOptions());

	const image = useStore(form.store, (state) => state.values.image);

	const handleExists = useMutation(api.profiles.handleExists.mutationOptions());

	return (
		<KeyboardAvoidingScrollView>
			<WebWrapper>
				<View className="gap-4 p-4">
					<Stack.Screen
						options={{
							title: "Edit Profile",
						}}
					/>
					<View className="flex flex-row items-center gap-4">
						<UserAvatar imageUrl={image?.uri} size={100} />
						<form.Field
							name="image"
							children={(field) => (
								<View>
									<Button
										variant="secondary"
										onPress={async () => {
											let result = await ImagePicker.launchImageLibraryAsync({
												mediaTypes: ["images"],
												allowsEditing: true,
												aspect: [1, 1],
												quality: 1,
											});

											if (
												!result.canceled &&
												result.assets &&
												result.assets.length > 0
											) {
												const asset = result.assets[0]!;
												field.handleChange({
													uri: asset.uri,
													type: asset.type ?? "image/jpeg",
													size: asset.fileSize!,
												});
											}
										}}>
										<Text>Pick an image</Text>
									</Button>
									{field.state.meta.errors.map((error) => (
										<Text
											className="mt-2 text-destructive"
											key={error?.message}>
											{error?.message}
										</Text>
									))}
								</View>
							)}
						/>
					</View>
					<form.Field
						name="name"
						children={(field) => (
							<View className="gap-2">
								<Text>Name</Text>
								<TextInput
									placeholder="Name"
									className="self-stretch rounded-md border border-border px-4 py-3 text-foreground"
									autoComplete="off"
									onChangeText={field.handleChange}
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<Text className="mt-2 text-destructive" key={error?.message}>
										{error?.message}
									</Text>
								))}
							</View>
						)}
					/>
					<form.Field
						name="handle"
						validators={{
							onChangeAsyncDebounceMs: 500,
							onChangeAsync: async ({ value }) => {
								if (value.length === 0) return;
								const exists = await handleExists.mutateAsync(value);
								if (exists) {
									return { message: "Handle already exists" };
								}
							},
						}}
						children={(field) => (
							<View className="gap-2">
								<Text>Handle</Text>
								<View>
									<AtSign
										className="absolute left-3 top-[11px] text-lg text-muted-foreground"
										size={16}
									/>
									<TextInput
										placeholder="Handle"
										className="self-stretch rounded-md border border-border py-3 pl-9 pr-4 text-foreground"
										autoComplete="off"
										onChangeText={field.handleChange}
										value={field.state.value}
									/>
									{field.state.meta.errors.map((error) => (
										<Text
											className="mt-2 text-destructive"
											key={error?.message}>
											{error?.message}
										</Text>
									))}
								</View>
							</View>
						)}
					/>
					<form.Field
						name="bio"
						children={(field) => (
							<View className="gap-2">
								<Text>Bio</Text>
								<TextInput
									placeholder="Bio"
									className="h-40 self-stretch rounded-md border border-border p-4 text-foreground"
									multiline
									autoComplete="off"
									onChangeText={field.handleChange}
									value={field.state.value}
								/>
								{field.state.meta.errors.map((error) => (
									<Text className="mt-2 text-destructive" key={error?.message}>
										{error?.message}
									</Text>
								))}
							</View>
						)}
					/>
					<Button
						onPress={form.handleSubmit}
						className="self-stretch"
						variant="secondary">
						{loading ? <Text>Loading...</Text> : <Text>Save</Text>}
					</Button>
					<Text variant="h4" className="text-center">
						My Top 6
					</Text>
					<TopListTab
						isUser
						tab={tab}
						album={topLists.album as ListWithResources | undefined}
						song={topLists.song as ListWithResources | undefined}
						artist={topLists.artist as ListWithResources | undefined}
					/>
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default EditProfile;

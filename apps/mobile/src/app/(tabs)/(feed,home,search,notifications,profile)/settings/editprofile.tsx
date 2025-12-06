import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { TopList } from "@/components/List/TopList";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { AtSign, Eraser } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@recordscratch/lib";
import {
	ListWithResources,
	UpdateProfileForm,
	UpdateProfileFormSchema,
} from "@recordscratch/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";

const TopListTab = ({
	tab = "ALBUM",
	album,
	song,
	artist,
}: {
	tab: string;
	album: ListWithResources | undefined;
	song: ListWithResources | undefined;
	artist: ListWithResources | undefined;
}) => {
	const [value, setValue] = useState(tab);
	const [editMode, setEditMode] = useState(false);

	return (
		<View>
			<Text variant="h4" className="text-center">
				My Top 6
			</Text>

			<Tabs value={value} onValueChange={setValue}>
				<View className="mt-2">
					<TabsList className="w-full flex-row">
						<TabsTrigger value="ALBUM" className="flex-1">
							<Text>Albums</Text>
						</TabsTrigger>
						<TabsTrigger value="SONG" className="flex-1">
							<Text>Songs</Text>
						</TabsTrigger>
						<TabsTrigger value="ARTIST" className="flex-1">
							<Text>Artists</Text>
						</TabsTrigger>
					</TabsList>
				</View>
				<TabsContent value="ALBUM">
					<TopList
						category="ALBUM"
						setEditMode={setEditMode}
						editMode={editMode}
						list={album}
						isUser={true}
					/>
				</TabsContent>
				<TabsContent value="SONG">
					<TopList
						category="SONG"
						setEditMode={setEditMode}
						editMode={editMode}
						list={song}
						isUser={true}
					/>
				</TabsContent>
				<TabsContent value="ARTIST">
					<TopList
						category="ARTIST"
						setEditMode={setEditMode}
						editMode={editMode}
						list={artist}
						isUser={true}
					/>
				</TabsContent>
			</Tabs>

			<Button
				className="flex w-full items-center"
				variant={editMode ? "destructive" : "outline"}
				onPress={() => {
					setEditMode(!editMode);
				}}>
				<Eraser size={20} className="text-foreground" />
			</Button>
			<View className="h-28"></View>
		</View>
	);
};

const EditProfile = () => {
	const { tab } = useLocalSearchParams<{ tab: string }>();
	const profile = useAuth((s) => s.profile!);
	const [topLists] = api.lists.topLists.useSuspenseQuery({
		userId: profile!.userId,
	});

	const setProfile = useAuth((s) => s.setProfile);
	const utils = api.useUtils();
	const [loading, setLoading] = useState(false);

	const form = useForm<UpdateProfileForm>({
		resolver: zodResolver(UpdateProfileFormSchema),
		defaultValues: {
			bio: profile.bio ?? undefined,
			image: {
				uri: getImageUrl(profile),
				type: "image/jpeg",
				size: 0,
			},
			name: profile.name,
			handle: profile.handle,
		},
	});

	const { mutate: updateProfile } = api.profiles.update.useMutation({
		onSuccess: async (profile, { handle }) => {
			await utils.profiles.me.invalidate();
			await utils.profiles.get.invalidate(handle);
			await setProfile(profile);
			await form.reset({
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
	});
	const { mutateAsync: getSignedURL } = api.profiles.getSignedURL.useMutation();

	const image = form.watch("image");
	const handle = form.watch("handle");
	const name = form.watch("name");

	const debouncedHandle = useDebounce(handle, 500);
	const { data: handleExists } = api.profiles.handleExists.useQuery(debouncedHandle, {
		enabled: debouncedHandle.length > 0 && debouncedHandle !== profile.handle,
	});

	useEffect(() => {
		if (handleExists) {
			form.setError("handle", {
				type: "validate",
				message: "Handle already exists",
			});
		} else {
			if (form.formState.errors.handle?.message === "Handle already exists") {
				form.clearErrors("handle");
			}
		}
	}, [form, handleExists]);

	const onSubmit = async (data: UpdateProfileForm) => {
		await setLoading(true);
		if (data.image) {
			const url = await getSignedURL({
				type: data.image.type,
				size: data.image.size,
			});

			const response = await fetch(data.image.uri);
			const blob = await response.blob();

			await fetch(url, {
				method: "PUT",
				body: blob,
				headers: {
					"Content-Type": data.image.type,
				},
			});
		}

		await updateProfile({
			bio: data.bio ?? null,
			name: data.name,
			handle: data.handle,
			imageUrl: null,
		});
		await setLoading(false);
	};

	const pageValid = () => {
		return (
			!form.getFieldState("name").invalid &&
			name?.length > 0 &&
			!form.getFieldState("handle").invalid &&
			handle?.length > 0 &&
			!form.getFieldState("bio").invalid &&
			!form.getFieldState("image").invalid &&
			!loading
		);
	};

	return (
		<KeyboardAvoidingScrollView>
			<WebWrapper>
				<View className="gap-3 p-4">
					<Stack.Screen
						options={{
							title: "Edit Profile",
						}}
					/>
					<View className="flex flex-row items-center gap-4">
						<UserAvatar imageUrl={image?.uri} size={100} />
						<Controller
							control={form.control}
							name="image"
							render={({ field: { onChange } }) => (
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
												onChange({
													uri: asset.uri,
													type: asset.type ?? "image/jpeg",
													size: asset.fileSize,
												});
											}
										}}>
										<Text>Pick an image</Text>
									</Button>
									{form.formState.errors.image && (
										<Text className="mt-2 text-destructive">
											{form.formState.errors.image.message}
										</Text>
									)}
								</View>
							)}
						/>
					</View>
					<Controller
						control={form.control}
						name="name"
						render={({ field }) => (
							<View className="gap-2">
								<Text>Name</Text>
								<TextInput
									{...field}
									placeholder="Name"
									className="self-stretch rounded-md border border-border px-4 py-3 text-foreground"
									autoComplete="off"
									onChangeText={field.onChange}
								/>
								{form.formState.errors.name && (
									<Text className="mt-2 text-destructive">
										{form.formState.errors.name.message}
									</Text>
								)}
							</View>
						)}
					/>
					<Controller
						control={form.control}
						name="handle"
						render={({ field }) => (
							<View className="gap-2">
								<Text>Handle</Text>
								<View>
									<AtSign
										className="absolute left-3 top-[11px] text-lg text-muted-foreground"
										size={16}
									/>
									<TextInput
										{...field}
										placeholder="Handle"
										className="self-stretch rounded-md border border-border py-3 pl-9 pr-4 text-foreground"
										autoComplete="off"
										onChangeText={field.onChange}
									/>
									{form.formState.errors.handle && (
										<Text className="mt-2 text-destructive">
											{form.formState.errors.handle.message}
										</Text>
									)}
								</View>
							</View>
						)}
					/>
					<Controller
						control={form.control}
						name="bio"
						render={({ field }) => (
							<View className="gap-2">
								<Text>Bio</Text>
								<TextInput
									{...field}
									placeholder="Bio"
									className="h-40 self-stretch rounded-md border border-border p-4 text-foreground"
									multiline
									autoComplete="off"
									onChangeText={field.onChange}
								/>
								{form.formState.errors.bio && (
									<Text className="mt-2 text-destructive">
										{form.formState.errors.bio.message}
									</Text>
								)}
							</View>
						)}
					/>
					<Button
						onPress={form.handleSubmit(onSubmit)}
						disabled={!pageValid()}
						className="self-stretch"
						variant="secondary">
						{loading ? <Text>Loading...</Text> : <Text>Save</Text>}
					</Button>
					<TopListTab
						tab={tab}
						album={topLists.album}
						song={topLists.song}
						artist={topLists.artist}
					/>
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default EditProfile;

import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { AtSign } from "@/lib/icons/IconsLoader";
import type { Onboard } from "@recordscratch/types";
import { OnboardSchema, invalidHandleRegex } from "@recordscratch/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, useStore } from "@tanstack/react-form";

const SlideWrapper = ({
	page,
	children,
	title,
}: {
	page: number;
	title?: string;
	children: React.ReactNode;
}) => {
	return (
		<Animated.View
			className={"w-full flex-col items-center justify-center gap-4 p-4"}
			entering={FadeIn}
			exiting={FadeOut}>
			{page !== 0 ? <Pill>STEP {page}/3</Pill> : null}
			{title ? (
				<Text className="my-8 text-center" variant="h1">
					{title}
				</Text>
			) : null}
			{children}
		</Animated.View>
	);
};

const pages = [
	{
		fields: [],
	},
	{
		fields: ["name", "handle"],
	},
	{
		fields: ["bio"],
	},
	{
		fields: ["image"],
	},
] as const;

const OnboardPage = () => {
	const utils = api.useUtils();
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const status = useAuth((s) => s.status);
	const setStatus = useAuth((s) => s.setStatus);
	const setProfile = useAuth((s) => s.setProfile);

	const { mutateAsync: createProfile } = api.profiles.create.useMutation({
		onSuccess: (profile) => {
			utils.profiles.me.invalidate();
			setProfile(profile);
			router.navigate("/(tabs)");
			setStatus("authenticated");
		},
	});
	const { mutateAsync: getSignedURL } = api.profiles.getSignedURL.useMutation();

	const form = useForm({
		validators: { onSubmit: OnboardSchema },
		defaultValues: {
			handle: "",
			name: "",
			bio: "",
			image: undefined,
		} as Onboard,
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			if (value.image) {
				const url = await getSignedURL({
					type: value.image.type,
					size: value.image.size,
				});

				const response = await fetch(value.image.uri);
				const blob = await response.blob();

				await fetch(url, {
					credentials: "include",
					method: "PUT",
					body: blob,
					headers: {
						"Content-Type": value.image.type,
					},
				});
			}

			await createProfile({
				name: value.name,
				handle: value.handle,
				bio: value.bio ?? null,
			});
		},
	});
	const { name, image, bio } = useStore(form.store, (state) => state.values);

	const handlePristine = useStore(form.store, (state) => state.fieldMeta.handle?.isPristine);

	const pageValid = useStore(form.store, (state) => {
		return [
			// Page 0
			true,
			// Page 1
			!state.isValidating &&
				!state.fieldMeta.name?.isPristine &&
				!state.fieldMeta.handle?.isPristine &&
				!!state.fieldMeta.name?.isValid &&
				!!state.fieldMeta.handle?.isValid,
			// Page 2
			!state.isValidating && !!state.fieldMeta.bio?.isValid,
			// Page 3
			!state.isValidating && !!state.fieldMeta.image?.isValid,
		];
	});

	useEffect(() => {
		if (status !== "needsonboarding") {
			router.replace("/(tabs)/");
		}
	}, [status, router]);

	const handleExists = api.profiles.handleExists.useMutation();

	useEffect(() => {
		if (!handlePristine) {
			form.setFieldValue("handle", name.replace(invalidHandleRegex, ""));
		}
	}, [handlePristine, form, name]);

	if (isLoading) {
		return (
			<View className="mx-auto flex min-h-[100svh] w-full max-w-screen-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
				<ActivityIndicator size="large" className="text-muted-foreground" />
				<Text className="mt-4 text-muted-foreground">Creating your account</Text>
			</View>
		);
	}

	const renderPage = (page: number) => {
		switch (page) {
			case 0:
				return (
					<SlideWrapper page={page} key={0}>
						<Image
							source={require("../../../assets/icon.png")}
							style={{
								width: 150,
								height: 150,
								borderRadius: 9999,
							}}
						/>
						<Text className="text-center text-4xl" variant="h1">
							Welcome to RecordScratch
						</Text>
						<Text className="mt-4 text-center">
							Before you get started we have to set up your profile.
						</Text>
						<Text className="mt-1 text-center">Press next below to get started.</Text>
					</SlideWrapper>
				);
			case 1:
				return (
					<SlideWrapper page={page} title="Pick a display name and handle" key={1}>
						<form.Field
							name="name"
							children={(field) => (
								<View className="relative self-stretch">
									<TextInput
										autoFocus
										placeholder="Display name"
										className="self-stretch rounded-md border border-border px-4 py-3 text-foreground"
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
							)}
						/>
						<form.Field
							name="handle"
							validators={{
								onChangeAsync: async ({ value }) => {
									if (value.length === 0) return;
									const exists = await handleExists.mutateAsync(value);
									if (exists) {
										return { message: "Handle already exists" };
									}
								},
								onChangeAsyncDebounceMs: 500,
							}}
							children={(field) => (
								<View className="self-stretch">
									<View className="flex flex-row items-center rounded-md border border-border">
										<View className="pl-3 pr-1.5">
											<AtSign
												className="text-lg text-muted-foreground"
												size={16}
											/>
										</View>
										<TextInput
											placeholder="Handle"
											className="mb-[1px] flex-1 py-3 pr-4 text-foreground"
											autoComplete="off"
											onChangeText={field.handleChange}
											value={field.state.value}
										/>
									</View>
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
					</SlideWrapper>
				);
			case 2:
				return (
					<SlideWrapper page={page} title="Describe yourself" key={2}>
						<form.Field
							name="bio"
							children={(field) => (
								<View className="self-stretch">
									<TextInput
										placeholder="Bio"
										className="h-40 self-stretch rounded-md border border-border p-4 text-foreground"
										multiline
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
							)}
						/>
					</SlideWrapper>
				);
			case 3:
				return (
					<SlideWrapper page={page} title="Image" key={3}>
						<UserAvatar imageUrl={image?.uri} size={200} />
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
													size: asset.fileSize ?? 0,
												});
											}
										}}
										className="mt-8">
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
					</SlideWrapper>
				);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<KeyboardAvoidingScrollView contentContainerClassName="items-center justify-center h-full">
				{renderPage(page)}
				<View className="mt-8 flex flex-row gap-4">
					{page !== 0 && (
						<Button variant="secondary" onPress={() => setPage((page) => page - 1)}>
							<Text>Back</Text>
						</Button>
					)}
					<Button
						variant="secondary"
						onPress={async () => {
							if (page === 3) {
								form.handleSubmit();
							} else {
								await Promise.all([
									pages[page].fields.map((field) =>
										form.validateField(field, "submit")
									),
								]);
								if (pageValid[page]) {
									setPage((page) => page + 1);
								}
							}
						}}>
						<Text>
							{page === 2 && !bio
								? "Skip"
								: page === 3 && !image
									? `Skip`
									: page === 3
										? "Finish"
										: "Next"}
						</Text>
					</Button>
				</View>
			</KeyboardAvoidingScrollView>
		</SafeAreaView>
	);
};

export default OnboardPage;

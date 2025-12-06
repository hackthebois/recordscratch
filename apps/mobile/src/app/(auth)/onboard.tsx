import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { AtSign } from "@/lib/icons/IconsLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@recordscratch/lib";
import type { Onboard } from "@recordscratch/types";
import { OnboardSchema, handleRegex } from "@recordscratch/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

const onInvalid = (errors: unknown) => console.error(errors);

const OnboardPage = () => {
	const utils = api.useUtils();
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const status = useAuth((s) => s.status);
	const setStatus = useAuth((s) => s.setStatus);
	const setProfile = useAuth((s) => s.setProfile);
	const form = useForm<Onboard>({
		resolver: zodResolver(OnboardSchema),
		mode: "onChange",
		defaultValues: {
			handle: "",
			name: "",
			bio: "",
			image: undefined,
		},
	});
	const { name, image, handle, bio } = form.watch();

	useEffect(() => {
		if (status !== "needsonboarding") {
			router.replace("/(tabs)/");
		}
	}, [status, router]);

	const { mutateAsync: createProfile } = api.profiles.create.useMutation({
		onSuccess: (profile) => {
			utils.profiles.me.invalidate();
			setProfile(profile);
			router.navigate("/(tabs)");
			setStatus("authenticated");
		},
	});
	const { mutateAsync: getSignedURL } = api.profiles.getSignedURL.useMutation();

	const debouncedHandle = useDebounce(handle, 500);
	const { data: handleExists } = api.profiles.handleExists.useQuery(debouncedHandle, {
		enabled: debouncedHandle?.length > 0,
	});
	const handleDoesNotExist = useMemo(
		() => handleExists !== undefined && !handleExists,
		[handleExists]
	);

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

	const onSubmit = async (data: Onboard) => {
		setLoading(true);
		if (data.image) {
			const url = await getSignedURL({
				type: data.image.type,
				size: data.image.size,
			});

			const response = await fetch(data.image.uri);
			const blob = await response.blob();

			await fetch(url, {
				credentials: "include",
				method: "PUT",
				body: blob,
				headers: {
					"Content-Type": data.image.type,
				},
			});
		}

		await createProfile({
			name: data.name,
			handle: data.handle,
			bio: data.bio ?? null,
		});
	};

	useEffect(() => {
		if (!form.getFieldState("handle").isTouched) {
			form.setValue(
				"handle",
				name?.replace(new RegExp(`[^${handleRegex.source}]+`, "g"), "").replace(" ", "")
			);
		}
	}, [form, name]);

	useEffect(() => {
		if (page === 1) {
			form.setFocus("name");
		}
	}, [form, page]);

	const pageValid = useMemo(() => {
		switch (page) {
			case 0:
				return true;
			case 1:
				return name?.length > 0 && handleDoesNotExist && handle?.length > 0;
			case 2:
				return !form.getFieldState("bio").invalid;
			case 3:
				return !form.getFieldState("image").invalid;
			default:
				return true;
		}
	}, [form, handleDoesNotExist, debouncedHandle, name, page]);

	if (loading) {
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
					<SlideWrapper page={page} /*pageIndex={0}*/ key={0}>
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
					<SlideWrapper
						page={page}
						// pageIndex={1}
						title="Pick a display name and handle"
						key={1}>
						<Controller
							control={form.control}
							name="name"
							render={({ field }) => (
								<View className="relative self-stretch">
									<TextInput
										{...field}
										placeholder="Display name"
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
								<View className="self-stretch">
									<View className="flex flex-row items-center rounded-md border border-border">
										<View className="pl-3 pr-1.5">
											<AtSign
												className="text-lg text-muted-foreground"
												size={16}
											/>
										</View>
										<TextInput
											{...field}
											placeholder="Handle"
											className="mb-[1px] flex-1 py-3 pr-4 text-foreground"
											autoComplete="off"
											onChangeText={field.onChange}
										/>
									</View>
									{form.formState.errors.handle && (
										<Text className="mt-2 text-destructive">
											{form.formState.errors.handle.message}
										</Text>
									)}
								</View>
							)}
						/>
					</SlideWrapper>
				);
			case 2:
				return (
					<SlideWrapper
						page={page}
						// pageIndex={2}
						title="Describe yourself"
						key={2}>
						<Controller
							control={form.control}
							name="bio"
							render={({ field }) => (
								<View className="self-stretch">
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
					</SlideWrapper>
				);
			case 3:
				return (
					<SlideWrapper page={page} /*pageIndex={3} */ title="Image" key={3}>
						<UserAvatar imageUrl={image?.uri} size={200} />
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
										}}
										className="mt-8">
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
						onPress={() => {
							if (page === 3) {
								form.handleSubmit(onSubmit, onInvalid)();
							} else {
								setPage((page) => page + 1);
							}
						}}
						disabled={!pageValid}>
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

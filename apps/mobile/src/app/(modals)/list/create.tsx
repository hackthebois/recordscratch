import { PortalHost } from "@rn-primitives/portal";
import { FullWindowOverlay } from "react-native-screens";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { Category, InsertList, insertListSchema } from "@recordscratch/types";
import { useState } from "react";
import { Platform, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { useAuth } from "@/lib/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, useStore } from "@tanstack/react-form";

const CUSTOM_PORTAL_HOST_NAME = "modal-create-list";
const WindowOverlay = Platform.OS === "ios" ? FullWindowOverlay : React.Fragment;

const CreateListModal = () => {
	const { categoryProp } = useLocalSearchParams<{
		categoryProp: string;
	}>();

	const router = useRouter();
	const utils = api.useUtils();
	const [loading, setLoading] = useState(false);

	const form = useForm({
		validators: {
			onSubmit: insertListSchema,
		},
		defaultValues: {
			name: "",
			description: "",
			category: categoryProp,
		} as InsertList,
		onSubmit: async ({ value }) => {
			setLoading(true);
			createList(value);
			setLoading(false);
			router.back();
		},
	});

	const profile = useAuth((s) => s.profile);

	const { mutate: createList } = api.lists.create.useMutation({
		onSuccess: () => {
			utils.lists.getUser.invalidate({ userId: profile!.userId });
		},
	});

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 16,
		right: 16,
	};

	return (
		<KeyboardAvoidingScrollView contentContainerClassName="p-4 gap-4">
			<form.Field
				name="name"
				children={(field) => (
					<View className="gap-2">
						<Text>Name</Text>
						<TextInput
							placeholder="Name"
							className="self-stretch rounded-md border border-border px-4 py-3 text-muted-foreground"
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
			{!categoryProp && (
				<form.Field
					name="category"
					children={(field) => (
						<View className="flex flex-col gap-2">
							<Text>Category</Text>
							<Select
								{...field}
								value={{
									label: field.state.value,
									value: field.state.value,
								}}
								onValueChange={(option) => field.handleChange(option?.value)}>
								<SelectTrigger>
									<SelectValue
										className="text-muted-foreground"
										placeholder={"Select a Category..."}
									/>
								</SelectTrigger>
								<SelectContent
									insets={contentInsets}
									className="mt-[68px] w-full"
									portalHost={CUSTOM_PORTAL_HOST_NAME}
									style={{ shadowOpacity: 0 }}>
									<SelectGroup>
										<SelectItem label="ALBUM" value="ALBUM">
											ALBUMS
										</SelectItem>
										<SelectItem label="SONG" value="SONG">
											SONGS
										</SelectItem>
										<SelectItem label="ARTIST" value="ARTIST">
											ARTISTS
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							{field.state.meta.errors.map((error) => (
								<Text className="mt-2 text-destructive" key={error?.message}>
									{error?.message}
								</Text>
							))}
						</View>
					)}
				/>
			)}
			<form.Field
				name="description"
				children={(field) => (
					<View className="gap-2">
						<Text>Description</Text>
						<TextInput
							placeholder="description"
							className="h-40 self-stretch rounded-md border border-border p-4 text-muted-foreground"
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

			<Button onPress={form.handleSubmit} className="self-stretch" variant="secondary">
				{loading ? <Text>Loading...</Text> : <Text>Save</Text>}
			</Button>
			<WindowOverlay>
				<PortalHost name={CUSTOM_PORTAL_HOST_NAME} />
			</WindowOverlay>
		</KeyboardAvoidingScrollView>
	);
};

export default CreateListModal;

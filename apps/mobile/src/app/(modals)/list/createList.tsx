import { PortalHost } from "@rn-primitives/portal";
import { FullWindowOverlay } from "react-native-screens";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, InsertList, insertListSchema } from "@recordscratch/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { useAuth } from "@/lib/auth";
import { useLocalSearchParams, useRouter } from "expo-router";

const CUSTOM_PORTAL_HOST_NAME = "modal-create-list";
const WindowOverlay = Platform.OS === "ios" ? FullWindowOverlay : React.Fragment;

const CreateListModal = () => {
	const { categoryProp } = useLocalSearchParams<{
		categoryProp: string;
	}>();

	const router = useRouter();
	const utils = api.useUtils();
	const [loading, setLoading] = useState(false);

	const form = useForm<InsertList>({
		resolver: zodResolver(insertListSchema),
		defaultValues: {
			category: categoryProp as Category,
		},
	});

	const name = form.watch("name");
	const category = form.watch("category");

	const profile = useAuth((s) => s.profile);

	const { mutate: createList } = api.lists.create.useMutation({
		onSuccess: () => {
			utils.lists.getUser.invalidate({ userId: profile!.userId });
		},
	});

	const onSubmit = async ({ name, category, description }: InsertList) => {
		setLoading(true);
		createList({
			name,
			category,
			description,
		});
		setLoading(false);
		router.back();
	};

	const pageValid = () => {
		return (
			!form.getFieldState("name").invalid &&
			name?.length > 0 &&
			!form.getFieldState("description").invalid &&
			!form.getFieldState("category").invalid &&
			category?.length > 0 &&
			!loading
		);
	};

	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 16,
		right: 16,
	};

	return (
		<KeyboardAvoidingScrollView contentContainerClassName="p-4 gap-8">
			<Controller
				control={form.control}
				name="name"
				render={({ field }) => (
					<View className="gap-2">
						<Text>Name</Text>
						<TextInput
							{...field}
							placeholder="Name"
							className="self-stretch rounded-md border border-border px-4 py-3 text-muted-foreground"
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
			{!categoryProp && (
				<Controller
					control={form.control}
					name="category"
					render={({ field }) => (
						<View>
							<Text>Category</Text>
							<Select
								{...field}
								value={{
									label: field.value,
									value: field.value,
								}}
								onValueChange={(option) => field.onChange(option?.value)}>
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
							{form.formState.errors.category && (
								<Text className="mt-2 text-destructive">
									{form.formState.errors.category.message}
								</Text>
							)}
						</View>
					)}
				/>
			)}
			<Controller
				control={form.control}
				name="description"
				render={({ field }) => (
					<View className="gap-2">
						<Text>Description</Text>
						<TextInput
							{...field}
							placeholder="description"
							className="h-40 self-stretch rounded-md border border-border p-4 text-muted-foreground"
							multiline
							autoComplete="off"
							onChangeText={field.onChange}
							value={field.value ?? ""}
						/>
						{form.formState.errors.description && (
							<Text className="mt-2 text-destructive">
								{form.formState.errors.description.message}
							</Text>
						)}
					</View>
				)}
			/>

			<Button
				onPress={() => {
					form.handleSubmit(onSubmit)();
				}}
				disabled={!pageValid()}
				className="self-stretch"
				variant="secondary">
				{loading ? <Text>Loading...</Text> : <Text>Save</Text>}
			</Button>
			<WindowOverlay>
				<PortalHost name={CUSTOM_PORTAL_HOST_NAME} />
			</WindowOverlay>
		</KeyboardAvoidingScrollView>
	);
};

export default CreateListModal;

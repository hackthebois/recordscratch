import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Button } from "@/components/ui/button";
import { api } from "@/components/Providers";
import { UpdateList, updateFormSchema } from "@recordscratch/types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Switch, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";

const SettingsPage = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const listId = id!;
	const [list] = api.lists.get.useSuspenseQuery({ id: listId });

	const [loading, setLoading] = useState(false);
	const profile = useAuth((s) => s.profile);

	const utils = api.useUtils();

	const form = useForm<UpdateList>({
		resolver: zodResolver(updateFormSchema),
		defaultValues: {
			description: list!.description ?? "",
			name: list!.name,
			onProfile: list!.onProfile,
		},
	});

	const name = form.watch("name");

	const { mutate: updateList } = api.lists.update.useMutation({
		onSuccess: () => {
			utils.lists.getUser.invalidate({ userId: list!.userId });
			utils.lists.get.invalidate({ id });
		},
	});

	const deleteResource = api.lists.delete.useMutation({
		onSettled: () => {
			utils.lists.getUser.invalidate({ userId: list!.userId });
			utils.lists.get.invalidate({ id: listId });
			if (list?.onProfile) utils.lists.topLists.invalidate({ userId: list!.userId });
		},
	}).mutate;

	if (!list || profile!.userId != list.userId) {
		return <NotFoundScreen />;
	}

	const onSubmit = async ({ name, description, onProfile }: UpdateList) => {
		setLoading(true);
		updateList({
			id,
			name,
			description,
			onProfile,
		});
		setLoading(false);
	};

	const pageValid = () => {
		return (
			!form.getFieldState("name").invalid &&
			name?.length > 0 &&
			!form.getFieldState("description").invalid &&
			!form.getFieldState("onProfile").invalid &&
			!loading
		);
	};

	const handleDelete = () => {
		if (!loading) {
			deleteResource({ id: listId });
			router.dismissAll();
			router.dismissTo({
				pathname: "/[handle]",
				params: { handle: profile!.handle },
			});
		}
	};

	return (
		<KeyboardAvoidingScrollView contentContainerClassName="h-full p-4 gap-8">
			<Stack.Screen
				options={{
					title: `Edit List`,
				}}
			/>
			<Controller
				control={form.control}
				name="onProfile"
				render={({ field }) => (
					<View className="flex flex-row items-center gap-3">
						<Text className="mt-2">Show as Top 6?</Text>
						<Switch {...field} onValueChange={field.onChange} />
						{form.formState.errors.onProfile && (
							<Text className="mt-2 text-destructive">
								{form.formState.errors.onProfile.message}
							</Text>
						)}
					</View>
				)}
			/>

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
				name="description"
				render={({ field }) => (
					<View className="gap-2">
						<Text>Description</Text>
						<TextInput
							{...field}
							placeholder="description"
							className="h-40 self-stretch rounded-md border border-border p-4 text-foreground"
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
				onPress={form.handleSubmit(onSubmit)}
				disabled={!pageValid()}
				className="self-stretch"
				variant="secondary">
				<Text>{loading ? "Loading..." : "Save"}</Text>
			</Button>
			<Button disabled={loading} variant="destructive" onPress={handleDelete}>
				<Text>Delete List</Text>
			</Button>
		</KeyboardAvoidingScrollView>
	);
};

export default SettingsPage;

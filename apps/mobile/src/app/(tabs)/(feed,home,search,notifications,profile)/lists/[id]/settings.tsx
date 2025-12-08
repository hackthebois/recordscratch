import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Button } from "@/components/ui/button";
import { UpdateList, updateFormSchema } from "@recordscratch/types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Switch, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useForm } from "@tanstack/react-form";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SettingsPage = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const listId = id!;
	const { data: list } = useSuspenseQuery(api.lists.get.queryOptions({ id: listId }));
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const profile = useAuth((s) => s.profile);

	const form = useForm({
		validators: {
			onSubmit: updateFormSchema,
		},
		defaultValues: {
			description: list?.description ?? "",
			name: list?.name,
			onProfile: list?.onProfile,
		} as UpdateList,
		onSubmit: async ({ value }) => {
			setLoading(true);
			updateList({
				id,
				...value,
			});
			setLoading(false);
			router.back();
		},
	});

	const { mutate: updateList } = useMutation(
		api.lists.update.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries(api.lists.get.queryOptions({ id })),
					queryClient.invalidateQueries(
						api.lists.getUser.queryOptions({ userId: list!.userId })
					),
				]);
			},
		})
	);

	const deleteResource = useMutation(
		api.lists.delete.mutationOptions({
			onSettled: async () => {
				await Promise.all([
					queryClient.invalidateQueries(api.lists.get.queryOptions({ id: listId })),
					queryClient.invalidateQueries(
						api.lists.getUser.queryOptions({ userId: list!.userId })
					),
					list?.onProfile &&
						queryClient.invalidateQueries(
							api.lists.topLists.queryOptions({ userId: list!.userId })
						),
				]);
			},
		})
	).mutate;

	if (!list || profile!.userId != list.userId) {
		return <NotFoundScreen />;
	}

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
			<form.Field
				name="onProfile"
				children={(field) => (
					<View className="flex flex-row items-center gap-3">
						<Switch onValueChange={field.handleChange} value={field.state.value} />
						<Text>Show as Top 6</Text>
						{field.state.meta.errors.map((error) => (
							<Text className="mt-2 text-destructive" key={error?.message}>
								{error?.message}
							</Text>
						))}
					</View>
				)}
			/>
			<form.Field
				name="name"
				children={(field) => (
					<View className="gap-2">
						<Text>Name</Text>
						<TextInput
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
				name="description"
				children={(field) => (
					<View className="gap-2">
						<Text>Description</Text>
						<TextInput
							className="h-40 self-stretch rounded-md border border-border p-4 text-foreground"
							multiline
							autoComplete="off"
							onChangeText={field.handleChange}
							value={field.state.value ?? ""}
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
				<Text>{loading ? "Loading..." : "Save"}</Text>
			</Button>
			<Button disabled={loading} variant="destructive" onPress={handleDelete}>
				<Text>Delete List</Text>
			</Button>
		</KeyboardAvoidingScrollView>
	);
};

export default SettingsPage;

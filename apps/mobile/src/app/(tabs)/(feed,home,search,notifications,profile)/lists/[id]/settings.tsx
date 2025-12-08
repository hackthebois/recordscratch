import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Button } from "@/components/ui/button";
import { api } from "@/components/Providers";
import { UpdateList, updateFormSchema } from "@recordscratch/types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Switch, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useForm } from "@tanstack/react-form";

const SettingsPage = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const listId = id!;
	const [list] = api.lists.get.useSuspenseQuery({ id: listId });

	const [loading, setLoading] = useState(false);
	const profile = useAuth((s) => s.profile);

	const utils = api.useUtils();

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
				<Text>{loading ? "Loading..." : "Save"}</Text>
			</Button>
			<Button disabled={loading} variant="destructive" onPress={handleDelete}>
				<Text>Delete List</Text>
			</Button>
		</KeyboardAvoidingScrollView>
	);
};

export default SettingsPage;

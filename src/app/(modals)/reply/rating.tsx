import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Review } from "@/components/Review";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, TextInput, View } from "react-native";
import { z } from "zod";
import { useWindowDimensions } from "react-native";
import { Send } from "@/lib/icons/IconsLoader";
import { useForm } from "@tanstack/react-form";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { headerRight } from "@/lib/navigation";

const Reply = () => {
	const { width } = useWindowDimensions();
	const router = useRouter();
	const { resourceId, handle } = useLocalSearchParams<{
		resourceId: string;
		handle: string;
	}>();
	const queryClient = useQueryClient();
	const { data: profile } = useSuspenseQuery(
		api.profiles.get.queryOptions(handle),
	);
	const { data: rating } = useSuspenseQuery(
		api.ratings.user.get.queryOptions({
			userId: profile!.userId,
			resourceId,
		}),
	);

	if (!profile || !rating) return <NotFoundScreen />;

	const form = useForm({
		validators: {
			onSubmit: z.object({ content: z.string() }),
		},
		defaultValues: {
			content: "",
		},
		onSubmit: async ({ value, formApi }) => {
			mutate({
				content: value.content,
				resourceId,
				authorId: profile.userId,
				parentId: null,
				rootId: null,
			});
			formApi.reset();
		},
	});

	const { mutate, isPending } = useMutation(
		api.comments.create.mutationOptions({
			onSuccess: async () => {
				router.back();
				router.navigate({
					pathname: "/[handle]/ratings/[id]",
					params: { handle, id: resourceId },
				});
			},
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.list.queryOptions({
							authorId: profile.userId,
							resourceId,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.count.rating.queryOptions({
							authorId: profile.userId,
							resourceId,
						}),
					),
				]),
		}),
	);

	return (
		<KeyboardAvoidingScrollView modal>
			<WebWrapper>
				<View className="p-4">
					<Stack.Screen
						options={{
							title: "Reply",
							...headerRight({
								type: "button",
								label: "Send",
								onPress: () => form.handleSubmit(),
							}),
						}}
					/>
					<Review {...rating} profile={profile} hideActions />
					<View className="bg-muted h-px" />
					<form.Field
						name="content"
						children={(field) => (
							<View className="flex-1 p-4">
								<TextInput
									placeholder="Create a new comment..."
									autoFocus
									multiline
									className="text-foreground text-lg outline-none"
									scrollEnabled={false}
									onChangeText={field.handleChange}
									value={field.state.value}
								/>
							</View>
						)}
					/>
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default Reply;

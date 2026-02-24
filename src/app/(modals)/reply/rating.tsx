import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Review } from "@/components/Review";
import { WebWrapper } from "@/components/WebWrapper";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TextInput, View } from "react-native";
import { z } from "zod";
import { Send } from "@/lib/icons/IconsLoader";
import { useForm } from "@tanstack/react-form";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useHeaderRight } from "@/lib/navigation";

const Reply = () => {
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

	const { mutate } = useMutation(
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

	const headerRight = useHeaderRight({
		type: "button",
		label: "Send",
		Icon: <Send size={16} className="text-foreground" />,
		onPress: () => form.handleSubmit(),
	});

	return (
		<KeyboardAvoidingScrollView modal>
			<WebWrapper>
				<Stack.Screen
					options={{
						title: "Reply",
						...headerRight,
					}}
				/>
				<Review {...rating} profile={profile} hideActions />
				<View className="bg-muted h-px" />
				<View className="flex-1 gap-4 p-4">
					<form.Field
						name="content"
						children={(field) => (
							<TextInput
								placeholder="Create a new comment..."
								autoFocus
								multiline
								className="text-foreground text-lg outline-none"
								scrollEnabled={false}
								onChangeText={field.handleChange}
								value={field.state.value}
							/>
						)}
					/>
					{headerRight.Button}
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default Reply;

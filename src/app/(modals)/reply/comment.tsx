import { Comment } from "@/components/Comment";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Send } from "@/lib/icons/IconsLoader";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TextInput, View, Platform, useWindowDimensions } from "react-native";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const CommentModal = () => {
	const { width } = useWindowDimensions();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { id } = useLocalSearchParams<{
		id: string;
	}>();

	const { data: comment } = useSuspenseQuery(
		api.comments.get.queryOptions({
			id,
		}),
	);

	if (!comment) return null;

	const { mutate, isPending } = useMutation(
		api.comments.create.mutationOptions({
			onSuccess: async () => {
				router.back();
			},
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.get.queryOptions({
							id,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.list.queryOptions({
							resourceId: comment.resourceId,
							authorId: comment.authorId,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.count.rating.queryOptions({
							resourceId: comment.resourceId,
							authorId: comment.authorId,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.count.reply.queryOptions({
							id: comment.rootId ?? comment.id,
						}),
					),
				]),
		}),
	);

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
				resourceId: comment.resourceId,
				authorId: comment.authorId,
				rootId: comment.rootId ?? comment.id,
				parentId: comment.id,
			});
			formApi.reset();
		},
	});

	return (
		<KeyboardAvoidingScrollView modal>
			<WebWrapper>
				<View className="p-4">
					<Stack.Screen
						options={{
							title: "Reply",
							unstable_headerRightItems: () => [
								{
									type: "button",
									label: "Send",
									onPress: () => form.handleSubmit(),
								},
							],
						}}
					/>
					<Comment comment={comment} hideActions />
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

					{Platform.OS === "web" ? (
						<Button
							onPress={form.handleSubmit}
							disabled={isPending}
							variant="secondary"
							size="sm"
						>
							<Text>Post</Text>
						</Button>
					) : null}
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default CommentModal;

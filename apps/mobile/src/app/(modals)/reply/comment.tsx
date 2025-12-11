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
		})
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
						})
					),
					queryClient.invalidateQueries(
						api.comments.list.queryOptions({
							resourceId: comment.resourceId,
							authorId: comment.authorId,
						})
					),
					queryClient.invalidateQueries(
						api.comments.count.rating.queryOptions({
							resourceId: comment.resourceId,
							authorId: comment.authorId,
						})
					),
					queryClient.invalidateQueries(
						api.comments.count.reply.queryOptions({
							id: comment.rootId ?? comment.id,
						})
					),
				]),
		})
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
							title: `Reply`,
							headerRight: () => (
								<Button
									onPress={form.handleSubmit}
									disabled={isPending}
									variant="secondary"
									style={{
										marginRight:
											width > 1024
												? (width - 1024) / 2
												: Platform.OS === "web"
													? 16
													: 0,
									}}
									className="flex-row items-center gap-2">
									<Send size={16} />
									<Text>Post</Text>
								</Button>
							),
						}}
					/>
					<Comment comment={comment} hideActions />
					<View className="h-[1px] bg-muted" />
					<form.Field
						name="content"
						children={(field) => (
							<View className="flex-1 p-4">
								<TextInput
									placeholder="Create a new comment..."
									autoFocus
									multiline
									className="text-lg text-foreground outline-none"
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
							size="sm">
							<Text>Post</Text>
						</Button>
					) : null}
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default CommentModal;

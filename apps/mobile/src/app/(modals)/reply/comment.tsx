import { Comment } from "@/components/Comment";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { Send } from "@/lib/icons/IconsLoader";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TextInput, View, Platform, useWindowDimensions } from "react-native";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

const CommentModal = () => {
	const { width } = useWindowDimensions();
	const router = useRouter();
	const { id } = useLocalSearchParams<{
		id: string;
	}>();

	const [comment] = api.comments.get.useSuspenseQuery({
		id,
	});

	if (!comment) return null;

	const utils = api.useUtils();

	const { mutate, isPending } = api.comments.create.useMutation({
		onSuccess: async () => {
			router.back();
		},
		onSettled: async () => {
			await utils.comments.get.invalidate({
				id,
			});
			await utils.comments.list.invalidate({
				resourceId: comment.resourceId,
				authorId: comment.authorId,
			});
			await utils.comments.count.rating.invalidate({
				resourceId: comment.resourceId,
				authorId: comment.authorId,
			});

			await utils.comments.count.reply.invalidate({
				id: comment.rootId ?? comment.id,
			});
		},
	});

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

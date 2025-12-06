import { Comment } from "@/components/Comment";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { Send } from "@/lib/icons/IconsLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View, Platform, useWindowDimensions } from "react-native";
import { z } from "zod";

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
	const form = useForm<{ content: string }>({
		resolver: zodResolver(z.object({ content: z.string() })),
		defaultValues: {
			content: "",
		},
	});

	const { mutate, isPending } = api.comments.create.useMutation({
		onSuccess: async () => {
			await form.reset();
			await router.back();
			// await router.navigate({
			// 	pathname: "/comments/[id]",
			// 	params: { id },
			// });
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

	const markSeen = api.notifications.markSeen.useMutation();

	const onSubmit = async ({ content }: { content: string }) => {
		mutate({
			content,
			resourceId: comment.resourceId,
			authorId: comment.authorId,
			rootId: comment.rootId ?? comment.id,
			parentId: comment.id,
		});
	};

	return (
		<KeyboardAvoidingScrollView modal>
			<WebWrapper>
				<View className="p-4">
					<Stack.Screen
						options={{
							title: `Reply`,
							headerRight: () => (
								<Button
									onPress={form.handleSubmit(onSubmit)}
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
					<Controller
						control={form.control}
						name="content"
						render={({ field }) => (
							<View className="flex-1 p-4">
								<TextInput
									placeholder="Create a new comment..."
									autoFocus
									multiline
									className="text-lg text-foreground outline-none"
									scrollEnabled={false}
									onChangeText={field.onChange}
									{...field}
								/>
							</View>
						)}
					/>

					{Platform.OS === "web" ? (
						<Button
							onPress={form.handleSubmit(onSubmit)}
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

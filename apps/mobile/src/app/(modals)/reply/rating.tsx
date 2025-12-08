import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Review } from "@/components/Review";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, TextInput, View } from "react-native";
import { z } from "zod";
import { useWindowDimensions } from "react-native";
import { Send } from "@/lib/icons/IconsLoader";
import { useForm } from "@tanstack/react-form";

const Reply = () => {
	const { width } = useWindowDimensions();
	const router = useRouter();
	const { resourceId, handle } = useLocalSearchParams<{
		resourceId: string;
		handle: string;
	}>();
	const [profile] = api.profiles.get.useSuspenseQuery(handle);
	const [rating] = api.ratings.user.get.useSuspenseQuery({
		userId: profile!.userId,
		resourceId,
	});

	if (!profile || !rating) return <NotFoundScreen />;

	const utils = api.useUtils();
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

	const { mutate, isPending } = api.comments.create.useMutation({
		onSuccess: async () => {
			router.back();
			router.navigate({
				pathname: "/[handle]/ratings/[id]",
				params: { handle, id: resourceId },
			});
		},
		onSettled: () => {
			utils.comments.list.invalidate({
				authorId: profile.userId,
				resourceId,
			});
			utils.comments.count.rating.invalidate({
				authorId: profile.userId,
				resourceId,
			});
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
									<Send size={16} className="text-foreground" />
									<Text>Post</Text>
								</Button>
							),
						}}
					/>
					<Review {...rating} profile={profile} hideActions />
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
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default Reply;

import NotFoundScreen from "@/app/+not-found";
import { KeyboardAvoidingScrollView } from "@/components/KeyboardAvoidingView";
import { Review } from "@/components/Review";
import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import { z } from "zod";
import { useWindowDimensions } from "react-native";
import { Send } from "@/lib/icons/IconsLoader";

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
			await router.navigate({
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

	const onSubmit = async ({ content }: { content: string }) => {
		mutate({
			content,
			resourceId,
			authorId: profile.userId,
			parentId: null,
			rootId: null,
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
									<Send size={16} className="text-foreground" />
									<Text>Post</Text>
								</Button>
							),
						}}
					/>
					<Review {...rating} profile={profile} hideActions />
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
				</View>
			</WebWrapper>
		</KeyboardAvoidingScrollView>
	);
};

export default Reply;

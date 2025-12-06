import { UserAvatar } from "@/components/UserAvatar";
import { Text } from "@/components/ui/text";
import { RouterOutputs, api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { Heart, MessageCircle } from "@/lib/icons/IconsLoader";
import { cn } from "@recordscratch/lib";
import { Reply } from "@/lib/icons/IconsLoader";
import { Trash } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { timeAgo } from "@recordscratch/lib";
import { Link, useRouter } from "expo-router";
import { Suspense, useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { CommentAndProfile, Comment as CommentType, Profile } from "@recordscratch/types";
import React from "react";
import { Skeleton } from "./ui/skeleton";

const DeactivateButton = ({ onPress }: { onPress: () => void }) => {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button variant="destructive" size="sm" onPress={() => setOpen(true)}>
					<Trash size={20} className="text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-450px">
				<DialogTitle>Delete Comment</DialogTitle>
				<DialogDescription>
					Do You Want to Delete this Comment for Violating Terms of Service?
				</DialogDescription>
				<View className="mt-4 flex flex-row items-center justify-center gap-3">
					<DialogClose>
						<Button variant="destructive" onPress={onPress}>
							<Text>Delete</Text>
						</Button>
					</DialogClose>
					<DialogClose>
						<Button variant="outline" onPress={() => setOpen(false)}>
							<Text>Cancel</Text>
						</Button>
					</DialogClose>
				</View>
			</DialogContent>
		</Dialog>
	);
};

const LikeButton = (props: { commentId: string }) => {
	const utils = api.useUtils();
	const { data: likeQuery } = api.comments.likes.get.useQuery(props);
	const { data: likesQuery } = api.comments.likes.getLikes.useQuery(props);

	const like = likeQuery ?? false;
	const likes = likesQuery ?? 0;
	const isLoading = likeQuery === undefined || likesQuery === undefined;
	const { mutate: likeMutation, isPending: isLiking } = api.comments.likes.like.useMutation({
		onSettled: async () => {
			await utils.comments.likes.get.invalidate(props);
			await utils.comments.likes.getLikes.invalidate(props);
		},
	});

	const { mutate: unlikeMutation, isPending: isUnLiking } = api.comments.likes.unlike.useMutation(
		{
			onSettled: async () => {
				await utils.comments.likes.get.invalidate(props);
				await utils.comments.likes.getLikes.invalidate(props);
			},
		}
	);

	const liked = isLiking ? true : isUnLiking ? false : like;
	const likesCount = isLiking ? likes + 1 : isUnLiking ? likes - 1 : likes;

	return (
		<Button
			variant="ghost"
			size={"sm"}
			onPress={() => {
				if (isLiking || isUnLiking) return;
				if (like) {
					unlikeMutation(props);
				} else {
					likeMutation(props);
				}
			}}
			className="flex-row gap-2">
			<Heart
				size={25}
				className={cn(
					liked
						? "fill-red-500 stroke-red-500"
						: "fill-background stroke-muted-foreground"
				)}
			/>
			{isLoading ? (
				<Skeleton className="flex-row gap-2">
					<Text className="font-bold">{likesCount}</Text>
				</Skeleton>
			) : (
				<Text className="font-bold">{likesCount}</Text>
			)}
		</Button>
	);
};

const CommentButton = ({ id, onPress }: { id: string; onPress?: () => void }) => {
	const [comments] = api.comments.count.reply.useSuspenseQuery({
		id,
	});

	return (
		<Button variant="ghost" size={"sm"} className="flex-row gap-2" onPress={onPress}>
			<MessageCircle size={25} className="text-muted-foreground" />
			<Text className="font-bold">{comments}</Text>
		</Button>
	);
};

export const Comment = ({
	comment: { id, rootId, content, profile, updatedAt, resourceId, authorId, deactivated },
	onCommentPress,
	hideActions,
}: {
	comment: CommentAndProfile;
	onCommentPress?: () => void;
	hideActions?: boolean;
}) => {
	const router = useRouter();
	const myProfile = useAuth((s) => s.profile);
	const utils = api.useUtils();

	const { mutate: deleteComment } = api.comments.delete.useMutation({
		onSettled: async () => {
			await utils.comments.list.invalidate({ resourceId, authorId });
			await utils.comments.count.rating.invalidate({
				resourceId,
				authorId,
			});
			if (rootId) await utils.comments.count.reply.invalidate({ id: rootId });
		},
	});

	const { mutate: deactivateComment } = api.comments.deactivate.useMutation({
		onSuccess: () => {
			if (!rootId) {
				router.back();
			}
		},
		onSettled: async () => {
			await utils.comments.list.invalidate({ resourceId, authorId });
			await utils.comments.count.rating.invalidate({
				resourceId,
				authorId,
			});
			if (rootId) await utils.comments.count.reply.invalidate({ id: rootId });
		},
	});
	if (deactivated) return null;

	return (
		<View className="gap-4 p-4">
			<Link href={`/${String(profile.handle)}`} asChild>
				<Pressable className="flex flex-row flex-wrap items-center gap-2">
					<UserAvatar imageUrl={getImageUrl(profile)} />
					<Text className="text-lg">{profile.name}</Text>
					<Text className="text-left text-lg text-muted-foreground">
						@{profile.handle} • {timeAgo(updatedAt)}
					</Text>
				</Pressable>
			</Link>
			<Text className="text-lg">{content}</Text>
			{!hideActions ? (
				<View className="-my-2 -ml-3 flex flex-row items-center">
					<LikeButton commentId={id} />
					{!rootId ? (
						<Suspense>
							<CommentButton id={id} onPress={onCommentPress} />
						</Suspense>
					) : null}
					<Link
						href={{
							pathname: "/(modals)/reply/comment",
							params: { id },
						}}
						asChild>
						<Button variant="ghost" size={"sm"}>
							<Reply size={25} className="text-muted-foreground" />
						</Button>
					</Link>
					{myProfile?.userId === profile.userId ? (
						<Button variant="ghost" size={"sm"} onPress={() => deleteComment({ id })}>
							<Trash size={20} className="text-muted-foreground" />
						</Button>
					) : myProfile?.role === "MOD" ? (
						<DeactivateButton onPress={() => deactivateComment({ id })} />
					) : null}
				</View>
			) : null}
		</View>
	);
};

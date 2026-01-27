import { UserAvatar } from "@/components/UserAvatar";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { Heart, MessageCircle } from "@/lib/icons/IconsLoader";
import { cn } from "@/lib";
import { Reply } from "@/lib/icons/IconsLoader";
import { Trash } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { timeAgo } from "@/lib";
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
import { CommentAndProfile } from "@/types";
import React from "react";
import { Skeleton } from "./ui/skeleton";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const DeactivateButton = ({ onPress }: { onPress: () => void }) => {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button
					variant="destructive"
					size="sm"
					onPress={() => setOpen(true)}
				>
					<Trash size={20} className="text-muted-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-450px">
				<DialogTitle>Delete Comment</DialogTitle>
				<DialogDescription>
					Do You Want to Delete this Comment for Violating Terms of
					Service?
				</DialogDescription>
				<View className="mt-4 flex flex-row items-center justify-center gap-3">
					<DialogClose>
						<Button variant="destructive" onPress={onPress}>
							<Text>Delete</Text>
						</Button>
					</DialogClose>
					<DialogClose>
						<Button
							variant="outline"
							onPress={() => setOpen(false)}
						>
							<Text>Cancel</Text>
						</Button>
					</DialogClose>
				</View>
			</DialogContent>
		</Dialog>
	);
};

const LikeButton = (props: { commentId: string }) => {
	const queryClient = useQueryClient();
	const { data: likeQuery } = useQuery(
		api.comments.likes.get.queryOptions(props),
	);
	const { data: likesQuery } = useQuery(
		api.comments.likes.getLikes.queryOptions(props),
	);

	const like = likeQuery ?? false;
	const likes = likesQuery ?? 0;
	const isLoading = likeQuery === undefined || likesQuery === undefined;
	const { mutate: likeMutation, isPending: isLiking } = useMutation(
		api.comments.likes.like.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.likes.get.queryOptions(props),
					),
					queryClient.invalidateQueries(
						api.comments.likes.getLikes.queryOptions(props),
					),
				]),
		}),
	);

	const { mutate: unlikeMutation, isPending: isUnLiking } = useMutation(
		api.comments.likes.unlike.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.likes.get.queryOptions(props),
					),
					queryClient.invalidateQueries(
						api.comments.likes.getLikes.queryOptions(props),
					),
				]),
		}),
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
			className="flex-row gap-2"
		>
			<Heart
				size={25}
				className={cn(
					liked
						? "fill-red-500 stroke-red-500"
						: "fill-background stroke-muted-foreground",
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

const CommentButton = ({
	id,
	onPress,
}: {
	id: string;
	onPress?: () => void;
}) => {
	const { data: comments } = useSuspenseQuery(
		api.comments.count.reply.queryOptions({
			id,
		}),
	);

	return (
		<Button
			variant="ghost"
			size={"sm"}
			className="flex-row gap-2"
			onPress={onPress}
		>
			<MessageCircle size={25} className="text-muted-foreground" />
			<Text className="font-bold">{comments}</Text>
		</Button>
	);
};

export const Comment = ({
	comment: {
		id,
		rootId,
		content,
		profile,
		updatedAt,
		resourceId,
		authorId,
		deactivated,
	},
	onCommentPress,
	hideActions,
}: {
	comment: CommentAndProfile;
	onCommentPress?: () => void;
	hideActions?: boolean;
}) => {
	const router = useRouter();
	const myProfile = useAuth((s) => s.profile);
	const queryClient = useQueryClient();

	const { mutate: deleteComment } = useMutation(
		api.comments.delete.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.list.queryOptions({
							resourceId,
							authorId,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.count.rating.queryOptions({
							resourceId,
							authorId,
						}),
					),
					rootId &&
						queryClient.invalidateQueries(
							api.comments.count.reply.queryOptions({
								id: rootId,
							}),
						),
				]),
		}),
	);

	const { mutate: deactivateComment } = useMutation(
		api.comments.deactivate.mutationOptions({
			onSuccess: () => {
				if (!rootId) {
					router.back();
				}
			},
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.comments.list.queryOptions({
							resourceId,
							authorId,
						}),
					),
					queryClient.invalidateQueries(
						api.comments.count.rating.queryOptions({
							resourceId,
							authorId,
						}),
					),
					rootId &&
						queryClient.invalidateQueries(
							api.comments.count.reply.queryOptions({
								id: rootId,
							}),
						),
				]),
		}),
	);
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
						asChild
					>
						<Button variant="ghost" size={"sm"}>
							<Reply
								size={25}
								className="text-muted-foreground"
							/>
						</Button>
					</Link>
					{myProfile?.userId === profile.userId ? (
						<Button
							variant="ghost"
							size={"sm"}
							onPress={() => deleteComment({ id })}
						>
							<Trash
								size={20}
								className="text-muted-foreground"
							/>
						</Button>
					) : myProfile?.role === "MOD" ? (
						<DeactivateButton
							onPress={() => deactivateComment({ id })}
						/>
					) : null}
				</View>
			) : null}
		</View>
	);
};

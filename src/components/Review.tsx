import { ResourceItem } from "@/components/Item/ResourceItem";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
	Heart,
	MessageCircle,
	Reply,
	Star,
	Trash,
} from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { timeAgo } from "@/lib";
import { Category, ReviewType, SelectComment, SelectLike } from "@/types";
import { Link } from "expo-router";
import React, { Suspense, useState } from "react";
import { Pressable, View } from "react-native";
import { WebWrapper } from "./WebWrapper";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { useAuth } from "@/lib/auth";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api, RouterInputs } from "@/lib/api";
import { useCSSVariable } from "uniwind";

const DeactivateButton = ({
	resourceId,
	userId,
	category,
	feedInput,
}: {
	resourceId: string;
	userId: string;
	category: Category;
	feedInput?: RouterInputs["ratings"]["feed"];
}) => {
	const queryClient = useQueryClient();
	const { mutate: deactivateRating } = useMutation(
		api.ratings.deactivate.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.ratings.get.queryOptions({ resourceId, category }),
					),
					queryClient.invalidateQueries(
						api.ratings.user.get.queryOptions({
							resourceId,
							userId,
						}),
					),
					feedInput &&
						queryClient.invalidateQueries(
							api.ratings.feed.queryOptions({ ...feedInput }),
						),
				]),
		}),
	);
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open}>
			<DialogTrigger>
				<Button
					variant="destructive"
					size="sm"
					onPress={() => setOpen(true)}
				>
					<Trash className="text-muted-foreground size-5" />
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
						<Button
							variant="destructive"
							onPress={() => {
								deactivateRating({ resourceId, userId });
								setOpen(false);
							}}
						>
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

const LikeButton = (props: SelectLike) => {
	const queryClient = useQueryClient();
	const { data: likes } = useSuspenseQuery(
		api.likes.getLikes.queryOptions(props),
	);
	const { data: like } = useSuspenseQuery(api.likes.get.queryOptions(props));

	const { mutate: likeMutation, isPending: isLiking } = useMutation(
		api.likes.like.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.likes.get.queryOptions(props),
					),
					queryClient.invalidateQueries(
						api.likes.getLikes.queryOptions(props),
					),
				]),
		}),
	);

	const { mutate: unlikeMutation, isPending: isUnLiking } = useMutation(
		api.likes.unlike.mutationOptions({
			onSettled: () =>
				Promise.all([
					queryClient.invalidateQueries(
						api.likes.get.queryOptions(props),
					),
					queryClient.invalidateQueries(
						api.likes.getLikes.queryOptions(props),
					),
				]),
		}),
	);

	const liked = isLiking ? true : isUnLiking ? false : like;
	const likesCount = isLiking ? likes + 1 : isUnLiking ? likes - 1 : likes;

	const colorMutedForeground = useCSSVariable("--color-muted-foreground");
	const heartColor = useCSSVariable("--color-heart") as string;

	return (
		<Button
			variant="ghost"
			size="sm"
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
				className="size-5"
				fill={liked ? heartColor : "transparent"}
				color={liked ? heartColor : (colorMutedForeground as string)}
			/>
			<Text className="font-bold">{likesCount}</Text>
		</Button>
	);
};

const CommentsButton = ({
	handle,
	resourceId,
	authorId,
}: SelectComment & {
	handle: string;
}) => {
	const { data: comments } = useSuspenseQuery(
		api.comments.count.rating.queryOptions({
			resourceId,
			authorId,
		}),
	);

	return (
		<Link
			href={{
				pathname: "/[handle]/ratings/[id]",
				params: { handle: handle, id: resourceId },
			}}
			asChild
		>
			<Button variant="ghost" size="sm" className="flex-row gap-2">
				<MessageCircle className="text-muted-foreground size-5" />
				<Text className="font-bold">{comments}</Text>
			</Button>
		</Link>
	);
};

export const Review = ({
	userId,
	parentId,
	rating,
	profile,
	content,
	resourceId,
	category,
	updatedAt,
	hideActions = false,
	feedInput,
}: ReviewType & {
	hideActions?: boolean;
	feedInput?: RouterInputs["ratings"]["feed"];
}) => {
	const myProfile = useAuth((s) => s.profile);
	const starColor = useCSSVariable("--color-star") as string;

	return (
		<WebWrapper>
			<View className="bg-background text-card-foreground flex flex-col gap-4 p-4">
				<ResourceItem
					resource={{ parentId, resourceId, category }}
					showType
					imageWidthAndHeight={60}
				/>
				<View className="flex flex-col items-start gap-4">
					<View className="flex w-full flex-col justify-between gap-4 text-lg sm:flex-row-reverse sm:items-center">
						<View className="flex flex-row items-center gap-1">
							{Array.from(Array(rating)).map((_, i) => (
								<Star
									key={i}
									className="size-5"
									color={starColor}
									fill={starColor}
								/>
							))}
							{Array.from(Array(10 - rating)).map((_, i) => (
								<Star
									key={i}
									className="size-5"
									color={starColor}
								/>
							))}
						</View>
						<Link href={`/${String(profile.handle)}`} asChild>
							<Pressable className="flex flex-row flex-wrap items-center gap-2">
								<UserAvatar imageUrl={getImageUrl(profile)} />
								<Text className="text-lg font-medium">
									{profile.name}
								</Text>
								<Text className="text-muted-foreground text-left text-lg">
									@{profile.handle} • {timeAgo(updatedAt)}
								</Text>
							</Pressable>
						</Link>
					</View>
					{!!content && <Text className="text-lg">{content}</Text>}
					{!hideActions ? (
						<View className="-my-2 -ml-3 flex flex-row items-center gap-1">
							<Suspense
								fallback={
									<></>
									// TODO
								}
							>
								<LikeButton
									resourceId={resourceId}
									authorId={userId}
								/>
							</Suspense>
							<Suspense
								fallback={
									<></>
									// TODO
								}
							>
								<CommentsButton
									handle={profile.handle}
									resourceId={resourceId}
									authorId={userId}
								/>
							</Suspense>
							<Link
								href={{
									pathname: "/(modals)/reply/rating",
									params: {
										resourceId,
										handle: profile.handle,
									},
								}}
								asChild
							>
								<Button variant="ghost" size="sm">
									<Reply className="text-muted-foreground size-6" />
								</Button>
							</Link>
							{myProfile?.role === "MOD" && (
								<DeactivateButton
									userId={profile.userId}
									resourceId={resourceId}
									category={category}
									feedInput={feedInput}
								/>
							)}
						</View>
					) : null}
				</View>
			</View>
		</WebWrapper>
	);
};

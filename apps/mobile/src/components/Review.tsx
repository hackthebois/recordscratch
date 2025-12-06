import { ResourceItem } from "@/components/Item/ResourceItem";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { RouterInputs, api } from "@/components/Providers";
import { Heart, MessageCircle, Reply, Star, Trash } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { cn, timeAgo } from "@recordscratch/lib";
import { Category, ReviewType, SelectComment, SelectLike } from "@recordscratch/types";
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
	const utils = api.useUtils();
	const { mutate: deactivateRating } = api.ratings.deactivate.useMutation({
		onSettled: async () => {
			await utils.ratings.get.invalidate({ resourceId, category });
			await utils.ratings.user.get.invalidate({ resourceId, userId });
			await utils.ratings.user.total.invalidate({ userId });
			if (feedInput) await utils.ratings.feed.invalidate({ ...feedInput });
		},
	});
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
						<Button
							variant="destructive"
							onPress={() => {
								deactivateRating({ resourceId, userId });
								setOpen(false);
							}}>
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

const LikeButton = (props: SelectLike) => {
	const utils = api.useUtils();
	const [likes] = api.likes.getLikes.useSuspenseQuery(props);
	const [like] = api.likes.get.useSuspenseQuery(props);

	const { mutate: likeMutation, isPending: isLiking } = api.likes.like.useMutation({
		onSettled: async () => {
			await utils.likes.get.invalidate(props);
			await utils.likes.getLikes.invalidate(props);
		},
	});

	const { mutate: unlikeMutation, isPending: isUnLiking } = api.likes.unlike.useMutation({
		onSettled: async () => {
			await utils.likes.get.invalidate(props);
			await utils.likes.getLikes.invalidate(props);
		},
	});

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
	const [comments] = api.comments.count.rating.useSuspenseQuery({
		resourceId,
		authorId,
	});

	return (
		<Link
			href={{
				pathname: "/[handle]/ratings/[id]",
				params: { handle: handle, id: resourceId },
			}}
			asChild>
			<Button variant="ghost" size={"sm"} className="flex-row gap-2">
				<MessageCircle size={25} className="text-muted-foreground" />
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
	deactivated,
	feedInput,
}: ReviewType & {
	hideActions?: boolean;
	feedInput?: RouterInputs["ratings"]["feed"];
}) => {
	const myProfile = useAuth((s) => s.profile);
	return (
		<WebWrapper>
			<View className="flex flex-col gap-4 bg-background p-4 text-card-foreground">
				<ResourceItem
					resource={{ parentId, resourceId, category }}
					showType
					imageWidthAndHeight={60}
				/>
				<View className="flex flex-col items-start gap-4">
					<View className="flex w-full flex-col justify-between gap-4 text-lg sm:flex-row-reverse sm:items-center">
						<View className="flex flex-row items-center gap-1">
							{Array.from(Array(rating)).map((_, i) => (
								<Star key={i} size={22} color="#ffb703" fill={"#ffb703"} />
							))}
							{Array.from(Array(10 - rating)).map((_, i) => (
								<Star key={i} size={22} color="#ffb703" />
							))}
						</View>
						<Link href={`/${String(profile.handle)}`} asChild>
							<Pressable className="flex flex-row flex-wrap items-center gap-2">
								<UserAvatar imageUrl={getImageUrl(profile)} />
								<Text className="font-medium text-lg">{profile.name}</Text>
								<Text className="text-left text-lg text-muted-foreground">
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
								}>
								<LikeButton resourceId={resourceId} authorId={userId} />
							</Suspense>
							<Suspense
								fallback={
									<></>
									// TODO
								}>
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
								asChild>
								<Button variant="ghost" size={"sm"}>
									<Reply size={25} className="text-muted-foreground" />
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

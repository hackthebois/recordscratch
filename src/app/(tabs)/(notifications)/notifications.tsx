import { Text } from "@/components/ui/text";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { useAuth } from "@/lib/auth";
import { BellOff } from "@/lib/icons/IconsLoader";
import { Heart } from "@/lib/icons/IconsLoader";
import { MessageCircle } from "@/lib/icons/IconsLoader";
import { User } from "@/lib/icons/IconsLoader";
import { getImageUrl } from "@/lib/image";
import { useRefreshByUser } from "@/lib/refresh";
import {
	cn,
	Notification,
	parseCommentNotification,
	parseFollowNotification,
	parseLikeNotification,
} from "@/lib";
import { FlashList } from "@shopify/flash-list";
import { Link, LinkProps, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api, RouterOutputs } from "@/lib/api";
import { Page } from "@/components/Page";
import { useCSSVariable } from "uniwind";

const NotificationBlock = ({
	icon,
	data,
	action,
	content,
	profile,
}: Notification & { icon: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { mutate } = useMutation(
		api.notifications.markSeen.mutationOptions({
			onSettled: () =>
				queryClient.invalidateQueries(
					api.notifications.getUnseen.queryOptions(),
				),
		}),
	);

	useEffect(() => {
		if (pathname === "/" && !data.notification.data.seen) {
			mutate(data.notification);
		}
	}, [data, mutate, pathname]);

	return (
		<Link href={data.url as LinkProps["href"]} asChild>
			<Pressable
				className={cn("flex flex-1 flex-row items-center gap-3 px-4")}
				style={{
					height: 75,
				}}
			>
				<View>{icon}</View>
				<View className="flex flex-1 flex-col gap-2">
					<View className="flex flex-1 flex-row items-center gap-3">
						<Pressable
							onPress={() => router.push(`/${profile.handle}`)}
						>
							<UserAvatar
								imageUrl={getImageUrl(profile)}
								size={50}
							/>
						</Pressable>
						<View className="flex flex-1 flex-row flex-wrap items-center">
							<Text numberOfLines={2}>
								<Text className="text-lg font-bold">
									{profile.name}
								</Text>
								<Text className="text-left text-lg">
									{" " + action + (content ? ": " : "")}
								</Text>
								{content ? (
									<Text className="text-muted-foreground text-lg">
										{content}
									</Text>
								) : null}
							</Text>
						</View>
					</View>
				</View>
			</Pressable>
		</Link>
	);
};

const NotificationItem = ({
	notification,
}: {
	notification: RouterOutputs["notifications"]["get"][0];
}) => {
	const profile = useAuth((s) => s.profile);
	const heartColor = useCSSVariable("--color-heart") as string;

	switch (notification.notifType) {
		case "follow":
			return (
				<NotificationBlock
					icon={<User className="size-7 text-sky-500" />}
					{...parseFollowNotification({
						profile: notification.profile,
						notification,
					})}
				/>
			);
		case "like":
			return (
				<NotificationBlock
					icon={<Heart color={heartColor} className="size-6" />}
					{...parseLikeNotification({
						profile: notification.profile,
						rating: notification.rating,
						handle: profile!.handle,
						notification,
					})}
				/>
			);
		case "comment":
			return (
				<NotificationBlock
					icon={<MessageCircle className="size-6 text-emerald-500" />}
					{...parseCommentNotification({
						profile: notification.profile,
						comment: notification.comment,
						handle: profile!.handle,
						notification,
					})}
				/>
			);
	}
};

export default function Notifications() {
	const { data: allNotifications, refetch } = useQuery(
		api.notifications.get.queryOptions(),
	);

	const { refetchByUser, isRefetchingByUser } = useRefreshByUser(refetch);

	const emptyNotifications = allNotifications?.length === 0;

	return (
		<Page title="Notifications">
			{emptyNotifications ? (
				<View className="my-[20vh] flex w-full flex-col items-center justify-center gap-6">
					<BellOff size={64} className="text-muted-foreground" />
					<Text className="text-muted-foreground">
						No notifications yet
					</Text>
				</View>
			) : (
				<FlashList
					data={allNotifications}
					keyExtractor={(item, index) =>
						`notification-${item.userId}-${index}`
					}
					ItemSeparatorComponent={() => (
						<WebWrapper>
							<View className="bg-border h-px sm:my-2" />
						</WebWrapper>
					)}
					renderItem={({ item }) => (
						<WebWrapper>
							<NotificationItem notification={item} />
						</WebWrapper>
					)}
					scrollEnabled={true}
					refreshing={isRefetchingByUser}
					onRefresh={refetchByUser}
					contentContainerClassName="sm:my-4"
				/>
			)}
		</Page>
	);
}

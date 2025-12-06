import { Text } from "@/components/ui/text";
import { UserAvatar } from "@/components/UserAvatar";
import { WebWrapper } from "@/components/WebWrapper";
import { api, RouterOutputs } from "@/components/Providers";
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
} from "@recordscratch/lib";
import { FlashList } from "@shopify/flash-list";
import { Link, LinkProps, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, View } from "react-native";

const NotificationBlock = ({
	icon,
	data,
	action,
	content,
	profile,
}: Notification & { icon: React.ReactNode }) => {
	const utils = api.useUtils();
	const pathname = usePathname();
	const { mutate } = api.notifications.markSeen.useMutation({
		onSettled: () => {
			utils.notifications.getUnseen.invalidate();
		},
	});

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
				}}>
				<View>{icon}</View>
				<View className="flex flex-1 flex-col gap-2">
					<View className="flex flex-1 flex-row items-center gap-3">
						<Link href={`/${profile.handle}`}>
							<UserAvatar imageUrl={getImageUrl(profile)} size={50} />
						</Link>
						<View className="flex flex-1 flex-row flex-wrap items-center">
							<Text numberOfLines={2}>
								<Text className="font-bold text-lg">{profile.name}</Text>
								<Text className="text-left text-lg">
									{" " + action + (content ? ": " : "")}
								</Text>
								{content ? (
									<Text className="text-lg text-muted-foreground">{content}</Text>
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
	switch (notification.notifType) {
		case "follow":
			return (
				<NotificationBlock
					icon={<User size={28} className="text-sky-500" />}
					{...parseFollowNotification({
						profile: notification.profile,
						notification,
					})}
				/>
			);
		case "like":
			return (
				<NotificationBlock
					icon={<Heart size={26} color="#ff4d4f" />}
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
					icon={<MessageCircle size={26} className="text-emerald-500" />}
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
	const { data: allNotifications, refetch } = api.notifications.get.useQuery();

	const { refetchByUser, isRefetchingByUser } = useRefreshByUser(refetch);

	const emptyNotifications = allNotifications?.length === 0;

	return (
		<>
			<Stack.Screen options={{ title: "Notifications" }} />
			{emptyNotifications ? (
				<View className="my-[20vh] flex w-full flex-col items-center justify-center gap-6">
					<BellOff size={64} className="text-muted-foreground" />
					<Text className="text-muted-foreground">No notifications yet</Text>
				</View>
			) : (
				<FlashList
					data={allNotifications}
					keyExtractor={(item, index) => `notification-${item.userId}-${index}`}
					ItemSeparatorComponent={() => (
						<WebWrapper>
							<View className="h-[2px] bg-muted sm:my-2" />
						</WebWrapper>
					)}
					renderItem={({ item }) => (
						<WebWrapper>
							<NotificationItem notification={item} />
						</WebWrapper>
					)}
					estimatedItemSize={75}
					scrollEnabled={true}
					refreshing={isRefetchingByUser}
					onRefresh={refetchByUser}
					contentContainerClassName="sm:my-4"
				/>
			)}
		</>
	);
}

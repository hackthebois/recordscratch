import { useAuth } from "@/lib/auth";
import { useNotificationObserver } from "@/lib/notifications/useNotificationObserver";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCSSVariable } from "uniwind";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabLayout() {
	const foregroundColor = useCSSVariable("--color-foreground") as string;
	const mutedColor = useCSSVariable("--color-muted") as string;
	const backgroundColor = useCSSVariable("--color-background") as string;
	const sessionId = useAuth((s) => s.sessionId);
	const { data: notifications } = useQuery(
		api.notifications.getUnseen.queryOptions(undefined, {
			enabled: !!sessionId,
		}),
	);

	useNotificationObserver();

	return (
		<NativeTabs
			disableTransparentOnScrollEdge
			tintColor={foregroundColor}
			backgroundColor={backgroundColor}
			rippleColor={mutedColor}
			indicatorColor={mutedColor}
		>
			<NativeTabs.Trigger name="(home)">
				<NativeTabs.Trigger.Label hidden={Platform.OS !== "web"}>
					Home
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{
						default: "house",
						selected: "house.fill",
					}}
					md="home"
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(search)">
				<NativeTabs.Trigger.Label hidden={Platform.OS !== "web"}>
					Search
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{
						default: "magnifyingglass",
						selected: "magnifyingglass",
					}}
					md="search"
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(feed)">
				<NativeTabs.Trigger.Label hidden={Platform.OS !== "web"}>
					Feed
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{
						default: "list.bullet",
						selected: "list.bullet",
					}}
					md="list"
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(notifications)">
				<NativeTabs.Trigger.Label hidden={Platform.OS !== "web"}>
					Notifications
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{ default: "bell", selected: "bell.fill" }}
					md="notifications"
				/>
				{notifications && notifications > 0 ? (
					<NativeTabs.Trigger.Badge>
						{notifications > 9 ? "9+" : String(notifications)}
					</NativeTabs.Trigger.Badge>
				) : null}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(profile)">
				<NativeTabs.Trigger.Label hidden={Platform.OS !== "web"}>
					Profile
				</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon
					sf={{
						default: "person.circle",
						selected: "person.circle.fill",
					}}
					md="verified_user"
				/>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

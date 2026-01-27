import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { Bell } from "@/lib/icons/IconsLoader";
import { Home } from "@/lib/icons/IconsLoader";
import { Rows3 } from "@/lib/icons/IconsLoader";
import { Search } from "@/lib/icons/IconsLoader";
import { User } from "@/lib/icons/IconsLoader";
import { useNotificationObserver } from "@/lib/notifications/useNotificationObserver";
import { cn } from "@/lib";
import { Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { Platform } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function TabLayout() {
	const sessionId = useAuth((s) => s.sessionId);
	const { data: notifications } = useQuery(
		api.notifications.getUnseen.queryOptions(undefined, {
			enabled: !!sessionId,
		}),
	);

	useNotificationObserver();

	return (
		<Tabs
			backBehavior="history"
			screenOptions={{
				headerTitleAlign: "center",
				tabBarShowLabel: false,
				sceneStyle: {
					paddingBottom: Platform.OS === "web" ? 0 : 80,
				},
				headerTitle: (props: any) => (
					<Text variant="h4">{props.children}</Text>
				),
				tabBarStyle: {
					height: 80,
					position: "absolute",
					display: Platform.OS === "web" ? "none" : "flex",
				},
				tabBarButton: ({ style, ...props }) => (
					<Pressable
						onPress={props.onPress}
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{props.children}
					</Pressable>
				),
			}}
		>
			<Tabs.Screen
				name="(home)"
				options={{
					title: "",
					tabBarIcon: ({ focused }) => (
						<Home
							size={26}
							className={cn(
								focused
									? "text-primary"
									: "text-muted-foreground",
							)}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="(search)"
				options={{
					title: "",
					tabBarIcon: ({ focused }) => (
						<Search
							size={26}
							className={cn(
								focused
									? "text-primary"
									: "text-muted-foreground",
							)}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="(feed)"
				options={{
					title: "",
					tabBarIcon: ({ focused }) => (
						<Rows3
							size={26}
							className={cn(
								focused
									? "text-primary"
									: "text-muted-foreground",
							)}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="(notifications)"
				options={{
					title: "",
					tabBarBadge: notifications
						? notifications > 9
							? "9+"
							: notifications
						: undefined,
					tabBarIcon: ({ focused }) => (
						<Bell
							size={26}
							className={cn(
								focused
									? "text-primary"
									: "text-muted-foreground",
							)}
						/>
					),
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="(profile)"
				options={{
					title: "",
					tabBarIcon: ({ focused }) => (
						<User
							size={26}
							className={cn(
								focused
									? "text-primary"
									: "text-muted-foreground",
							)}
						/>
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}

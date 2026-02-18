import { useAuth } from "@/lib/auth";
import { Bell } from "@/lib/icons/IconsLoader";
import { Home } from "@/lib/icons/IconsLoader";
import { Rows3 } from "@/lib/icons/IconsLoader";
import { Search } from "@/lib/icons/IconsLoader";
import { User } from "@/lib/icons/IconsLoader";
import { useNotificationObserver } from "@/lib/notifications/useNotificationObserver";
import React, { ReactElement } from "react";
import { DynamicColorIOS } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCSSVariable } from "uniwind";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
	const backgroundColor = useCSSVariable("--color-background");
	const borderColor = useCSSVariable("--color-border");
	const sessionId = useAuth((s) => s.sessionId);
	const { data: notifications } = useQuery(
		api.notifications.getUnseen.queryOptions(undefined, {
			enabled: !!sessionId,
		}),
	);

	useNotificationObserver();

	return (
		<NativeTabs
		//labelStyle={{
		//	// For the text color
		//	color: DynamicColorIOS({
		//		dark: "white",
		//		light: "black",
		//	}),
		//}}
		//// For the selected icon color
		//tintColor={DynamicColorIOS({
		//	dark: "white",
		//	light: "black",
		//})}
		//re
		//backBehavior="history"
		//screenOptions={{
		//	headerTitleAlign: "center",
		//	tabBarShowLabel: false,
		//	sceneStyle: {
		//		paddingBottom: Platform.OS === "web" ? 0 : 80,
		//	},
		//	headerTitle: (props: any) => (
		//		<Text variant="h4">{props.children}</Text>
		//	),
		//	tabBarStyle: {
		//		height: 80,
		//		position: "absolute",
		//		backgroundColor: backgroundColor as string,
		//		display: Platform.OS === "web" ? "none" : "flex",
		//		borderTopColor: borderColor as string,
		//	},
		//	tabBarButton: ({ style, ...props }) => (
		//		<Pressable
		//			onPress={props.onPress}
		//			style={{
		//				flex: 1,
		//				justifyContent: "center",
		//				alignItems: "center",
		//			}}
		//		>
		//			{props.children}
		//		</Pressable>
		//	),
		//}}
		>
			<NativeTabs.Trigger name="(home)">
				<Label>Home</Label>
				<Icon
					src={{
						default: (
							<Home
								color={backgroundColor as string}
								fill={borderColor as string}
							/>
						),
						selected: (
							<Home
								color={backgroundColor as string}
								fill={borderColor as string}
							/>
						),
					}}
					renderingMode="original"
				/>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(search)">
				<Label>Search</Label>
				<Search size={26} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(feed)">
				<Label>Feed</Label>
				<Rows3 size={26} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger
				name="(notifications)"
				//options={{
				//	title: "",
				//	tabBarBadge: notifications
				//		? notifications > 9
				//			? "9+"
				//			: notifications
				//		: undefined,
				//	tabBarIcon: ({ focused }) => (
				//		<Bell
				//			size={26}
				//			className={cn(
				//				focused
				//					? "text-primary"
				//					: "text-muted-foreground",
				//			)}
				//		/>
				//	),
				//	headerShown: false,
				//}}
			>
				<Label>Notifications</Label>
				<Bell size={26} />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(profile)">
				<Label>Profile</Label>
				<User size={26} />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

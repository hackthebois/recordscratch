import { Text } from "@/components/ui/text";
import { api } from "@/components/Providers";
import { useAuth } from "@/lib/auth";
import { Bell } from "@/lib/icons/IconsLoader";
import { Home } from "@/lib/icons/IconsLoader";
import { Rows3 } from "@/lib/icons/IconsLoader";
import { Search } from "@/lib/icons/IconsLoader";
import { User } from "@/lib/icons/IconsLoader";
import { useNotificationObserver } from "@/lib/notifications/useNotificationObserver";
import { cn } from "@recordscratch/lib";
import { Tabs, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { Platform } from "react-native";

export default function TabLayout() {
	const router = useRouter();
	const sessionId = useAuth((s) => s.sessionId);
	const { data: notifications } = api.notifications.getUnseen.useQuery(undefined, {
		enabled: !!sessionId,
	});

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
				headerTitle: (props: any) => <Text variant="h4">{props.children}</Text>,
				tabBarStyle: {
					height: 80,
					position: "absolute",
					display: Platform.OS === "web" ? "none" : "flex",
				},
				tabBarButton: ({ style, ...props }) => (
					<Pressable
						{...props}
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					/>
				),
				// TODO: Add blur background when bug is fixed: Unimplemented component <ViewManagerAdapter...
				// tabBarBackground: () => (
				// 	<BlurView
				// 		tint={colorScheme === "dark" ? "dark" : "light"}
				// 		intensity={20}
				// 		style={{
				// 			position: "absolute",
				// 			top: 0,
				// 			left: 0,
				// 			right: 0,
				// 			bottom: 0,
				// 		}}
				// 	/>
				// ),
				//headerLeft: () => (
				//  <Pressable onPress={() => router.back()} >
				//    <ArrowLeft size={28} className="text-primary" />
				//  </Pressable>
				//),
			}}>
			<Tabs.Screen
				name="(home)"
				options={{
					title: "",
					tabBarIcon: ({ focused }) => (
						<Home
							size={26}
							className={cn(focused ? "text-primary" : "text-muted-foreground")}
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
							className={cn(focused ? "text-primary" : "text-muted-foreground")}
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
							className={cn(focused ? "text-primary" : "text-muted-foreground")}
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
							className={cn(focused ? "text-primary" : "text-muted-foreground")}
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
							className={cn(focused ? "text-primary" : "text-muted-foreground")}
						/>
					),
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}

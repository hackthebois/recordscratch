import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { BellOff } from "@/lib/icons/IconsLoader";
import { BellRing } from "@/lib/icons/IconsLoader";
import { HelpCircle } from "@/lib/icons/IconsLoader";
import { Moon } from "@/lib/icons/IconsLoader";
import { Sun } from "@/lib/icons/IconsLoader";
import { UserMinus } from "@/lib/icons/IconsLoader";
import { UserPen } from "@/lib/icons/IconsLoader";
import { ReceiptText } from "@/lib/icons/IconsLoader";
import { ShieldCheck } from "@/lib/icons/IconsLoader";
import { useColorScheme } from "@/lib/useColorScheme";
import { reloadAppAsync } from "expo";
import { Link, Stack } from "expo-router";
import { ScrollView, View } from "react-native";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SettingsPage = () => {
	const logout = useAuth((s) => s.logout);
	const { setColorScheme, colorScheme } = useColorScheme();
	const queryClient = useQueryClient();

	const { data: user } = useQuery(api.users.me.queryOptions());
	const updateUser = useMutation(
		api.users.update.mutationOptions({
			onSuccess: () => queryClient.invalidateQueries(api.users.me.queryOptions()),
		})
	);

	return (
		<ScrollView>
			<WebWrapper>
				<View className="gap-4 p-4">
					<Stack.Screen
						options={{
							title: "Settings",
						}}
					/>
					<Link href={`/settings/editprofile`} asChild>
						<Button variant="outline" className="flex-row justify-between gap-2">
							<Text>Edit Profile</Text>
							<UserPen className="text-muted-foreground" size={20} />
						</Button>
					</Link>
					<Link href={"/settings/support"} asChild>
						<Button
							variant="outline"
							className="flex-row items-center justify-between gap-2">
							<Text>Support</Text>
							<HelpCircle className="text-muted-foreground" size={20} />
						</Button>
					</Link>
					<Button
						variant="outline"
						onPress={async () =>
							setColorScheme(colorScheme === "dark" ? "light" : "dark")
						}
						className="flex-row items-center justify-between gap-2">
						<View className="flex-1 flex-row items-center justify-between gap-2">
							<Text>Theme</Text>
							{colorScheme === "light" ? (
								<View className="flex-row items-center gap-2">
									<Text className="text-blue-500">Light</Text>
									<Sun className="text-blue-500" size={20} />
								</View>
							) : (
								<View className="flex-row items-center gap-2">
									<Text className="text-purple-500">Dark</Text>
									<Moon className="text-purple-500" size={20} />
								</View>
							)}
						</View>
					</Button>
					<Button
						variant="outline"
						onPress={async () =>
							updateUser.mutate({
								notificationsEnabled: !user?.notificationsEnabled,
							})
						}
						className="flex-row items-center justify-between gap-2"
						disabled={updateUser.isPending || user?.notificationsEnabled === undefined}>
						<View className="flex-1 flex-row items-center justify-between gap-2">
							<Text>Push Notifications</Text>
							{user?.notificationsEnabled ? (
								<View className="flex-row items-center gap-2">
									<Text className="text-green-500">On</Text>
									<BellRing size={20} className="text-green-500" />
								</View>
							) : (
								<View className="flex-row items-center gap-2">
									<Text className="text-red-500">Off</Text>
									<BellOff size={20} className="text-red-500" />
								</View>
							)}
						</View>
					</Button>
					<Link href={`/settings/privacy`} asChild>
						<Button variant="outline" className="flex-row justify-between gap-2">
							<Text>Privacy Policy</Text>
							<ShieldCheck size={20} className="text-muted-foreground" />
						</Button>
					</Link>
					<Link href={`/settings/terms`} asChild>
						<Button variant="outline" className="flex-row justify-between gap-2">
							<Text>Terms of Use</Text>
							<ReceiptText size={20} className="text-muted-foreground" />
						</Button>
					</Link>
					<Link href={`/settings/deleteaccount`} asChild>
						<Button variant="outline" className="flex-row justify-between gap-2">
							<Text>Delete Account</Text>
							<UserMinus className="text-destructive" size={20} />
						</Button>
					</Link>
					<Button
						variant="secondary"
						onPress={async () => {
							await logout();
							await reloadAppAsync();
						}}>
						<Text>Sign Out</Text>
					</Button>
				</View>
			</WebWrapper>
		</ScrollView>
	);
};

export default SettingsPage;

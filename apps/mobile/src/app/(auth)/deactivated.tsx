import { Linking, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Discord } from "@/lib/icons/Discord";
import { socials } from "@recordscratch/lib";
import { Hand } from "@/lib/icons/IconsLoader";
import { useRouter } from "expo-router";
import { reloadAppAsync } from "expo";
import { useAuth } from "@/lib/auth";

const deactivated = () => {
	const logout = useAuth((s) => s.logout);
	const openUrl = async (url: string) => {
		const supported = await Linking.canOpenURL(url);
		if (supported) {
			await Linking.openURL(url);
		}
	};

	return (
		<View className="mx-4 flex-1 items-center justify-center gap-16">
			<Hand size={100} color="red" fillOpacity={0} />
			<Text variant="h2" className="text-center">
				Your account has been deactivated for violating our terms of service.
			</Text>
			<View className="flex flex-col items-center justify-center gap-5">
				<Text variant="h4" className="text-center">
					You can appeal this decision by contacting support through our discord
				</Text>
				<Button
					variant="outline"
					onPress={() => openUrl(socials.discord)}
					className="flex-row items-center gap-3">
					<Discord size={20} />
					<Text>Discord</Text>
				</Button>
			</View>
			<Button
				variant="secondary"
				onPress={async () => {
					await logout();
					await reloadAppAsync();
				}}>
				<Text>Sign Out</Text>
			</Button>
		</View>
	);
};
export default deactivated;

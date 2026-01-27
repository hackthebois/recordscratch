import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Discord } from "@/lib/icons/Discord";
import { Mail } from "@/lib/icons/IconsLoader";
import { socials } from "@/lib";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";

function RouteComponent() {
	const openUrl = async (url: string) => {
		const supported = await Linking.canOpenURL(url);
		if (supported) {
			await Linking.openURL(url);
		}
	};

	return (
		<ScrollView>
			<WebWrapper>
				<View className="gap-10 p-4">
					<Stack.Screen
						options={{
							title: "Support",
						}}
					/>
					<Text className="text-lg">
						Need help with RecordScratch? We're here to assist you.
						Choose your preferred method of contact below.
					</Text>
					<View className="items-start gap-4">
						<Text variant="h2">Discord Community</Text>
						<Text className="text-xl">
							Join our Discord community for:
						</Text>
						<View>
							<Text className="text-lg text-muted-foreground">
								• Real-time support from our team and community
							</Text>
							<Text className="text-lg text-muted-foreground">
								• Feature discussions and suggestions
							</Text>
							<Text className="text-lg text-muted-foreground">
								• Bug reports
							</Text>
							<Text className="text-lg text-muted-foreground">
								• Connect with fellow music lovers
							</Text>
						</View>
						<Button
							variant="outline"
							onPress={() => openUrl(socials.discord)}
							className="flex-row items-center gap-3"
						>
							<Discord size={18} />
							<Text>Join our Discord</Text>
						</Button>
					</View>
					<View className="items-start gap-4">
						<Text variant="h2">Email Support</Text>
						<Text className="text-lg">
							For other inquiries, you can reach us via email. We
							typically respond within 24-48 hours.
						</Text>
						<Button
							onPress={() => openUrl(`mailto:${socials.email}`)}
							variant="outline"
							className="flex-row items-center gap-3"
						>
							<Mail className="text-muted-foreground" size={20} />
							<Text>Send us an Email</Text>
						</Button>
						<Text className="text-lg text-muted-foreground">
							Alternatively, copy our email address:{" "}
							{socials.email}
						</Text>
					</View>
				</View>
			</WebWrapper>
		</ScrollView>
	);
}

export default RouteComponent;

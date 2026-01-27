import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function NotFoundScreen() {
	const router = useRouter();
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className="flex h-96 items-center justify-center gap-10">
				<Text variant="h2">This page doesn't exist.</Text>
				<Button variant="secondary" onPress={() => router.replace("/(tabs)")}>
					<Text>Return to Home Screen</Text>
				</Button>
			</View>
		</>
	);
}

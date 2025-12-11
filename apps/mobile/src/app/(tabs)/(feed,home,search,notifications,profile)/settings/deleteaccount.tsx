import { WebWrapper } from "@/components/WebWrapper";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/auth";
import { catchError } from "@/lib/errors";
import { Dot } from "@/lib/icons/IconsLoader";
import { useMutation } from "@tanstack/react-query";
import { reloadAppAsync } from "expo";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Switch, View } from "react-native";

export default function DeleteAccount() {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const deleteAccount = useAuth((s) => s.delete);

	const { mutate: handleDeleteAccount, isPending } = useMutation({
		mutationFn: async () => {
			await deleteAccount().catch(catchError);
			await reloadAppAsync();
		},
	});

	if (isPending) {
		return (
			<View className="mx-auto flex min-h-[100svh] w-full max-w-screen-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
				<ActivityIndicator size="large" className="text-muted-foreground" />
				<Text className="mt-4 text-muted-foreground">Deleting account.</Text>
			</View>
		);
	}

	return (
		<ScrollView>
			<WebWrapper>
				<View className="gap-6 p-4">
					<Stack.Screen
						options={{
							title: "Delete Account",
						}}
					/>
					<Text className="mb-3 font-bold text-lg">
						Warning: This action cannot be undone
					</Text>
					<View>
						<Text className="mb-2">Deleting your Account will permanently remove:</Text>
						<View className="flex-row items-center">
							<Dot className="text-muted-foreground" size={30} />
							<Text>All your ratings and comments</Text>
						</View>
						<View className="flex-row items-center">
							<Dot className="text-muted-foreground" size={30} />
							<Text>All your connections and followers</Text>
						</View>
						<View className="flex-row items-center">
							<Dot className="text-muted-foreground" size={30} />
							<Text>Any saved content</Text>
						</View>
					</View>
					<View className="flex-row items-center gap-4">
						<Switch
							value={confirmDelete}
							onValueChange={setConfirmDelete}
							trackColor={{ false: "#767577", true: "#767577" }}
						/>
						<Text className="flex-1">
							I understand that this action is permanent and cannot be reversed
						</Text>
					</View>
					<Button
						onPress={() => handleDeleteAccount()}
						disabled={!confirmDelete}
						variant="destructive"
						className="w-full">
						<Text>Delete Account</Text>
					</Button>
				</View>
			</WebWrapper>
		</ScrollView>
	);
}

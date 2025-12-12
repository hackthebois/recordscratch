import { Text } from "@/components/ui/text";
import env from "@/env";
import { handleLoginRedirect, useAuth } from "@/lib/auth";
import { catchError } from "@/lib/errors";
import { useColorScheme } from "@/lib/useColorScheme";
import { reloadAppAsync } from "expo";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as Browser from "expo-web-browser";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { z } from "zod";

Browser.maybeCompleteAuthSession();

const SignInPage = () => {
	const login = useAuth((s) => s.login);
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const [isAuthoring, setIsAuthoring] = useState(false);

	const handlePressButtonAsync = async (adapter: "google") => {
		if (isAuthoring) return;
		try {
			setIsAuthoring(true);

			if (Platform.OS === "web") {
				const url = `${env.SITE_URL}/api/auth/${adapter}?expoAddress=${env.SCHEME}`;
				await Linking.openURL(url);
				return;
			} else {
				if (Platform.OS === "ios") {
					// Doesn't exist on Android
					Browser.dismissAuthSession();
				}
				const result = await Browser.openAuthSessionAsync(
					`${env.SITE_URL}/api/auth/${adapter}?expoAddress=${env.SCHEME}`,
					`${env.SCHEME}`
				);
				if (result.type !== "success") return;
				const url = Linking.parse(result.url);
				const sessionId = url.queryParams?.session_id?.toString() ?? null;
				if (!sessionId) return;

				await login(sessionId)
					.then(({ status }) => handleLoginRedirect({ status, router }))
					.catch((e) => {
						catchError(e);
						reloadAppAsync();
					});
			}
		} catch (e) {
			catchError(e);
		} finally {
			setIsAuthoring(false);
		}
	};

	const appleLogo = {
		light: require("../../../assets/apple_black.svg"),
		dark: require("../../../assets/apple_white.svg"),
	};

	return (
		<View className="flex-1 items-center justify-center gap-6">
			<Image
				source={require("../../../assets/icon.png")}
				style={{
					width: 150,
					height: 150,
					borderRadius: 9999,
				}}
			/>
			<Text variant="h1" className="text-center text-4xl">
				Welcome to RecordScratch
			</Text>

			<Pressable
				disabled={isAuthoring}
				onPress={async () => await handlePressButtonAsync("google")}
				className="flex-row items-center gap-4 rounded-full border border-border px-8 py-4">
				<Image
					source={require("../../../assets/google-logo.svg")}
					style={{
						width: 30,
						height: 30,
					}}
				/>
				<Text className="font-medium text-lg">Sign in with Google</Text>
			</Pressable>
			{Platform.OS === "ios" || Platform.OS === "macos" ? (
				<Pressable
					disabled={isAuthoring}
					onPress={async () => {
						if (isAuthoring) return;
						try {
							setIsAuthoring(true);
							const credential = await AppleAuthentication.signInAsync({
								requestedScopes: [
									AppleAuthentication.AppleAuthenticationScope.EMAIL,
								],
							});
							const { identityToken, email } = credential;

							const res = await fetch(
								`${env.SITE_URL}/api/auth/apple/mobile/callback`,
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										idToken: identityToken,
										email: email ?? undefined,
									}),
								}
							);
							const { sessionId } = z
								.object({
									sessionId: z.string(),
								})
								.parse(await res.json());

							await login(sessionId)
								.then(({ status }) => handleLoginRedirect({ status, router }))
								.catch((e) => {
									catchError(e);
									reloadAppAsync();
								});
						} catch (e) {
							if (
								e instanceof Error &&
								e.message === "The user canceled the authorization attempt"
							) {
								return;
							}
							catchError(e);
						} finally {
							setIsAuthoring(false);
						}
					}}
					className="flex-row items-center gap-4 rounded-full border border-border px-8 py-4">
					<Image
						key={colorScheme}
						source={colorScheme === "dark" ? appleLogo.dark : appleLogo.light}
						style={{
							width: 26,
							height: 30,
						}}
					/>
					<Text className="font-medium text-lg">Sign in with Apple</Text>
				</Pressable>
			) : null}
		</View>
	);
};

export default SignInPage;

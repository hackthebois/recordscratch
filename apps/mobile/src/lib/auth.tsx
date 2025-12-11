import env from "@/env";
import { Profile, ProfileSchema, UserSchema } from "@recordscratch/types";
import { Router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext } from "react";
import SuperJSON from "superjson";
import { z } from "zod";
import { createStore, useStore } from "zustand";
import { registerForPushNotificationsAsync } from "./notifications";
import { Platform } from "react-native";

type Status = "loading" | "authenticated" | "unauthenticated" | "needsonboarding" | "deactivated";

// Define the context type
type Auth = {
	status: Status;
	sessionId: string | null;
	pushToken: string | null;
	profile: Profile | null;
	logout: () => Promise<void>;
	login: (session?: string) => Promise<{ status: Auth["status"] }>;
	setSessionId: (sessionId: string) => Promise<void>;
	setPushToken: (pushToken: string) => void;
	setProfile: (profile: Profile) => void;
	setStatus: (status: Auth["status"]) => void;
	delete: () => Promise<void>;
};

type AuthStore = ReturnType<typeof createAuthStore>;

export const createAuthStore = () =>
	createStore<Auth>()((set, get) => ({
		status: "loading",
		sessionId: null,
		pushToken: null,
		setPushToken: (pushToken) => set({ pushToken }),
		setSessionId: async (sessionId) => {
			if (Platform.OS !== "web") {
				await SecureStore.setItemAsync("sessionId", sessionId);
			}
			set({ sessionId });
		},
		setStatus: (status) => set({ status }),
		profile: null,
		setProfile: (profile) => set({ profile }),
		logout: async () => {
			const sessionId = get().sessionId;
			await fetch(env.SITE_URL + "/api/auth/signout", {
				credentials: "include",
				headers: {
					"Expo-Push-Token": get().pushToken ?? "",
					...(sessionId ? { Authorization: sessionId } : {}),
				},
			});
			if (Platform.OS !== "web") {
				await SecureStore.deleteItemAsync("sessionId");
			}
		},
		login: async (session?: string) => {
			let sessionId: string | undefined = session;
			let expoPushToken: string | undefined;

			if (Platform.OS !== "web" && !sessionId) {
				sessionId = (await SecureStore.getItemAsync("sessionId")) ?? undefined;
				expoPushToken = await registerForPushNotificationsAsync();
				set({ pushToken: expoPushToken });
			}

			const res = await fetch(`${env.SITE_URL}/api/auth/me`, {
				credentials: "include",
				headers: {
					"Expo-Push-Token": expoPushToken ?? "",
					...(sessionId ? { Authorization: sessionId } : {}),
				},
			});

			const data = await res.json();
			const parsedData = z
				.object({
					user: UserSchema.extend({
						profile: ProfileSchema.nullish(),
					}).nullable(),
				})
				.safeParse(
					SuperJSON.deserialize({
						json: data,
						meta: {
							values: {
								"user.profile.createdAt": ["Date"],
								"user.profile.updatedAt": ["Date"],
							},
						},
					})
				);

			if (parsedData.error || !parsedData.data.user) {
				set({
					sessionId: null,
					profile: null,
					status: "unauthenticated",
				});
				return { status: "unauthenticated" };
			} else {
				get().setSessionId(sessionId ?? "");
				if (parsedData.data.user.profile) {
					get().setProfile(parsedData.data.user.profile);
					const status = parsedData.data.user.profile.deactivated
						? "deactivated"
						: "authenticated";
					set({ status: status });
					return { status: status };
				} else {
					set({ status: "needsonboarding" });
					return { status: "needsonboarding" };
				}
			}
		},
		delete: async () => {
			const sessionId = get().sessionId;
			if (!sessionId) return;
			if (Platform.OS === "web") {
				await SecureStore.deleteItemAsync("sessionId");
			}
			// Delete user
			const res = await fetch(`${env.SITE_URL}/api/auth/delete`, {
				method: "DELETE",
				credentials: "include",
				headers: { Authorization: sessionId },
			});
			return await res.json();
		},
	}));

export const AuthContext = createContext<AuthStore | null>(null);

export const handleLoginRedirect = async ({
	status,
	router,
}: {
	status: Auth["status"];
	router: Router;
}) => {
	if (status === "authenticated") {
		router.replace("/(tabs)");
	} else if (status === "needsonboarding") {
		router.replace("/(auth)/onboard");
	} else if (status === "deactivated") {
		router.replace("/(auth)/deactivated");
	} else {
		router.replace("/(auth)/signin");
	}
};

export function useAuth<T>(selector: (state: Auth) => T): T {
	const store = useContext(AuthContext);
	if (!store) throw new Error("Missing AuthContext.Provider in the tree");
	return useStore(store, selector);
}

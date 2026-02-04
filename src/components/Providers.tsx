import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { catchError } from "@/lib/errors";
import { handleLoginRedirect, createAuthStore, AuthContext } from "@/lib/auth";
import { usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { reloadAppAsync } from "expo";
import { useStore } from "zustand";
import { Platform, useColorScheme } from "react-native";
import { queryClient } from "@/lib/api";
import { THEME } from "@/lib/constants";

export const QueryProvider = (props: { children: React.ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>
			{props.children}
		</QueryClientProvider>
	);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const store = useRef(createAuthStore()).current;
	const login = useStore(store, (s) => s.login);
	const status = useStore(store, (s) => s.status);
	const pathname = usePathname();

	// Hide the splash screen when the user isn't going to home page
	useEffect(() => {
		if (status !== "authenticated" && status !== "loading") {
			SplashScreen.hide();
		}
	}, [status]);

	useEffect(() => {
		login()
			.then(({ status }) => {
				if (status !== "authenticated" || pathname === "/signin") {
					handleLoginRedirect({ status, router });
				}
			})
			.catch((e) => {
				catchError(e);
				if (Platform.OS !== "web") {
					reloadAppAsync();
				}
			});
	}, [login]);

	useEffect(() => {
		if (
			status !== "loading" &&
			(status !== "authenticated" || pathname === "/signin")
		) {
			handleLoginRedirect({ status, router });
		}
	}, [pathname]);

	if (status === "loading") {
		return null;
	}

	return (
		<AuthContext.Provider value={store}>{children}</AuthContext.Provider>
	);
};

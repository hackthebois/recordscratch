import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";
import env from "@/env";
import { useAuth } from "@/lib/auth";
import { catchError } from "@/lib/errors";
import { handleLoginRedirect, createAuthStore, AuthContext } from "@/lib/auth";
import { usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { reloadAppAsync } from "expo";
import { useStore } from "zustand";
import { Platform } from "react-native";
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@recordscratch/api";

export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@recordscratch/api";

export const TRPCProvider = (props: { children: React.ReactNode }) => {
	const sessionId = useAuth((s) => s.sessionId);

	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (error) => {
						(catchError({ ...error, sessionId: sessionId }), reloadAppAsync());
					},
				}),
			})
	);

	const trpcClient = api.createClient({
		links: [
			loggerLink({
				enabled: () => env.DEBUG,
				colorMode: "ansi",
			}),
			httpBatchLink({
				transformer: superjson,
				url: `${env.SITE_URL}/trpc`,
				async headers() {
					const headers = new Map<string, string>();
					headers.set("x-trpc-source", "expo-react");
					headers.set("Authorization", `${sessionId}`);
					return Object.fromEntries(headers);
				},
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: "include",
					});
				},
			}),
		],
	});

	return (
		<api.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
		</api.Provider>
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
		if (status !== "loading" && (status !== "authenticated" || pathname === "/signin")) {
			handleLoginRedirect({ status, router });
		}
	}, [pathname]);

	if (status === "loading") {
		return null;
	}

	return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};

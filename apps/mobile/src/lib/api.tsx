import env from "@/env";
import type { AppRouter } from "@recordscratch/api";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";
import { catchError } from "./errors";
import { reloadAppAsync } from "expo";

export { type RouterInputs, type RouterOutputs } from "@recordscratch/api";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			(catchError({ ...error }), reloadAppAsync());
		},
	}),
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: () => env.DEBUG,
			colorMode: "ansi",
		}),
		httpBatchLink({
			transformer: superjson,
			url: `${env.SITE_URL}/trpc`,
			async headers() {
				const sessionId = await SecureStore.getItemAsync("sessionId");
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

export const api = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

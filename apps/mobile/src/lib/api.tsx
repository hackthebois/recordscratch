import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React, { useState } from "react";

import env from "@/env";
import type { AppRouter } from "@recordscratch/api";
import { useAuth } from "./auth";
import { catchError } from "./errors";
import superjson from "superjson";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
// export { type RouterInputs, type RouterOutputs } from "@recordscratch/api";

// /**
//  * A wrapper for your app that provides the TRPC context.
//  * Use only in _app.tsx
//  */ export function TRPCProvider(props: { children: React.ReactNode }) {
// 	const sessionId = useAuth((s) => s.sessionId);

// // 	const [queryClient] = useState(
// 		() =>
// 			new QueryClient({
// 				queryCache: new QueryCache({
// 					onError: (error) =>
// 						catchError({ ...error, sessionId: sessionId }),
// 				}),
// 			}),
// 	);

// 	const trpcClient = api.createClient({
// 		links: [
// 			loggerLink({
// 				enabled: () => env.DEBUG,
// 				colorMode: "ansi",
// 			}),
// 			httpBatchLink({
// 				transformer: superjson,
// 				url: `${env.SITE_URL}/trpc`,
// 				async headers() {
// 					const headers = new Map<string, string>();
// 					headers.set("x-trpc-source", "expo-react");
// 					if (sessionId) {
// 						headers.set("Authorization", `${sessionId}`);
// 					}
// 					return Object.fromEntries(headers);
// 				},
// 				fetch(url, options) {
// 					return fetch(url, {
// 						...options,
// 						credentials: "include",
// 					});
// 				},
// 			}),
// 		],
// 	});

// 	return (
// 		<api.Provider client={trpcClient} queryClient={queryClient}>
// 			<QueryClientProvider client={queryClient}>
// 				{props.children}
// 			</QueryClientProvider>
// 		</api.Provider>
// 	);
// }

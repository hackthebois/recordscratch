import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@recordscratch/api";
import { getCookie } from "hono/cookie";
import { contextStorage } from "hono/context-storage";
import type { ServerEnv } from "@recordscratch/types";
import { createTRPCContext } from "@recordscratch/api";
import { cors } from "hono/cors";
import { googleHandler } from "./auth/google";
import { appleHandler } from "./auth/apple";
import { userRatingsHandler } from "./user-ratings";
import { authHandler } from "./auth";
import { resourceRatingsHandler } from "./resource-ratings";

export const honoApp = new Hono<{ Bindings: ServerEnv }>()
	.use(
		cors({
			origin: [
				"https://recordscratch.app",
				"https://www.recordscratch.app",
				"http://localhost:8081",
			],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			credentials: true,
		}),
	)
	.use(contextStorage())
	.use(
		"/trpc/*",
		trpcServer({
			router: appRouter,
			createContext: (_, c) => {
				return createTRPCContext({
					sessionId:
						c.req.header("Authorization") ??
						getCookie(c, "session"),
					c,
				});
			},
		}),
	)
	.route("/api/resource/ratings", resourceRatingsHandler)
	.route("/api/user/ratings", userRatingsHandler)
	.route("/api/auth/google", googleHandler)
	.route("/api/auth/apple", appleHandler)
	.route("/api/auth", authHandler)
	.get("/music/**", async (c) => {
		const url = "https://api.deezer.com" + c.req.url.split("/music")[1];
		return fetch(url, { ...c.req.raw });
	})
	.get("/ingest/**", async (c) => {
		const url = "https://app.posthog.com" + c.req.url.split("/ingest")[1];
		return fetch(url, { ...c.req.raw });
	});

export type AppType = typeof honoApp;

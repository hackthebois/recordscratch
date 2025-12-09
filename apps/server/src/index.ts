import { Hono } from "hono";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@recordscratch/api";
import { getCookie } from "hono/cookie";
import { createTRPCContext } from "@recordscratch/api";
import { cors } from "hono/cors";
import { googleHandler } from "./auth/google";
import { appleHandler } from "./auth/apple";
import { authHandler } from "./auth";
import { proxy } from "hono/proxy";

const app = new Hono()
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
	.use(logger())
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
	.get("/music/**", async (c) => {
		return proxy("https://api.deezer.com" + c.req.url.split("/music")[1]);
	})
	.get("/ingest/**", async (c) => {
		return proxy("https://app.posthog.com" + c.req.url.split("/ingest")[1]);
	})
	.route("/api/auth/google", googleHandler)
	.route("/api/auth/apple", appleHandler)
	.route("/api/auth", authHandler);

export default app;

import { Hono } from "hono";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@/server/api";
import { getCookie } from "hono/cookie";
import { createTRPCContext } from "@/server/api";
import { cors } from "hono/cors";
import { googleHandler } from "./auth/google";
import { appleHandler } from "./auth/apple";
import { authHandler } from "./auth";
import { proxy } from "hono/proxy";
import z from "zod";

const DeezerErrorSchema = z.object({
	error: z.object({
		code: z.number(),
		message: z.string(),
		type: z.string(),
	}),
});

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
		const headers = c.req.header();
		delete headers["host"];

		const res = await fetch(
			"https://api.deezer.com" + c.req.url.split("/music")[1],
			{
				headers,
			},
		);

		const json = await res.json();

		const error = DeezerErrorSchema.safeParse(json);

		if (error.success) return c.json(error.data, 500);

		return c.json(json);
	})
	.get("/ingest/**", (c) => {
		const headers = c.req.header();
		delete headers["host"];

		return proxy(
			"https://app.posthog.com" + c.req.url.split("/ingest")[1],
			{
				headers,
			},
		);
	})
	.route("/api/auth/google", googleHandler)
	.route("/api/auth/apple", appleHandler)
	.route("/api/auth", authHandler);

export default app;

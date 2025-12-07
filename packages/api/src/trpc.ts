import { validateSessionToken } from "@recordscratch/auth";
import { getDB, profile } from "@recordscratch/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { AwsClient } from "aws4fetch";
import SuperJSON from "superjson";
import { ZodError } from "zod";
import type { ServerEnv } from "@recordscratch/types";
import { PostHog } from "posthog-node";
import type { Context } from "hono";
import { eq, and } from "drizzle-orm";

export const createTRPCContext = async ({
	sessionId,
	c,
}: {
	sessionId?: string | null;
	c: Context;
}) => {
	const r2 = new AwsClient({
		accessKeyId: c.env.R2_KEY_ID,
		secretAccessKey: c.env.R2_ACCESS_KEY,
		region: "auto",
	});
	const db = getDB(c.env.DATABASE_URL);

	const ph = new PostHog(c.env.POSTHOG_KEY, {
		host: c.env.POSTHOG_HOST,
	});
	console.log("PostHog initialized");
	if (!sessionId) {
		return {
			db,
			r2,
			ph,
			userId: null,
			c,
		};
	}

	const { session } = await validateSessionToken(c, sessionId);

	if (!session) {
		return {
			db,
			r2,
			ph,
			userId: null,
			c,
		};
	}

	return {
		db,
		r2,
		ph,
		userId: session.userId,
		c,
	};
};

const t = initTRPC
	.context<typeof createTRPCContext & { env: ServerEnv }>()
	.create({
		transformer: SuperJSON,
		errorFormatter({ shape, error }) {
			return {
				...shape,
				data: {
					...shape.data,
					zodError:
						error.cause instanceof ZodError
							? error.cause.flatten()
							: null,
				},
			};
		},
	});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource.",
		});
	}

	return next({
		ctx: {
			...ctx,
			userId: ctx.userId,
		},
	});
});

export const moderatorProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource.",
		});
	}

	const isModerator = await ctx.db
		.select()
		.from(profile)
		.where(and(eq(profile.role, "MOD"), eq(profile.userId, ctx.userId)));
	if (!isModerator) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be a moderator to access this resource.",
		});
	}

	return next({
		ctx: {
			...ctx,
			userId: ctx.userId,
		},
	});
});

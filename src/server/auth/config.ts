import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { sessions, users } from "@/server/db/schema";
import type { Session, User } from "@/types";
import { eq, or } from "drizzle-orm";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";
import { z } from "zod";
import { getDB } from "@/server/db";

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const createSession = async (
	token: string,
	userId: string,
): Promise<Session> => {
	const db = getDB();
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	await db.insert(sessions).values(session);
	return session;
};

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const db = getDB();
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	const result = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessions)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(sessions.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(token: string): Promise<void> {
	const db = getDB();
	const sessionId = encodeHexLowerCase(
		sha256(new TextEncoder().encode(token)),
	);
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	},
};

export function generateId(length: number, alphabet?: string): string {
	return generateRandomString(
		random,
		alphabet ??
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		length,
	);
}

export const setSessionCookie = (
	c: Context,
	token: string | undefined,
): void => {
	if (token) {
		setCookie(c, "session", token, {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			...(process.env.NODE_ENV === "production"
				? { domain: ".recordscratch.app" }
				: {}),
			path: "/",
			maxAge: 60 * 60 * 24 * 14, // 14 days
		});
	} else {
		setCookie(c, "session", "", {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			...(process.env.NODE_ENV === "production"
				? { domain: ".recordscratch.app" }
				: {}),
			path: "/",
			expires: new Date(0),
		});
	}
};

export const validateState = async (c: Context, PKCE: boolean) => {
	const query = c.req.query();
	const formData = await c.req.formData().catch(() => new FormData());
	const code = z.string().parse(query.code ?? formData.get("code"));
	const state = z.string().parse(query.state ?? formData.get("state"));
	const storedState = getCookie(c, "state");

	if (!code || !storedState || state !== storedState) {
		throw new Error("Invalid state");
	}

	if (PKCE) {
		const codeVerifier = getCookie(c, "codeVerifier");
		if (!codeVerifier) {
			throw new Error("Invalid code verifier");
		}
		return { code, codeVerifier, formData };
	}

	return { code, codeVerifier: "", formData };
};

export const handleUser = async (
	c: Context,
	options: {
		googleId?: string;
		appleId?: string;
		email?: string;
		onReturn?: "redirect" | "sessionId";
	},
) => {
	const db = getDB();
	const { googleId, appleId, email, onReturn = "redirect" } = options;
	const expoAddress = c.req.query("expoAddress");
	let userId: string;
	let redirect: string;

	const existingUser = await db.query.users.findFirst({
		where: or(
			googleId ? eq(users.googleId, googleId) : undefined,
			appleId ? eq(users.appleId, appleId) : undefined,
		),
	});

	if (!existingUser) {
		userId = generateId(15);
		await db.insert(users).values({
			id: userId,
			email,
			googleId,
			appleId,
		});
		redirect = "/onboard";
	} else {
		userId = existingUser.id;
		redirect = "/";
	}

	const token = generateSessionToken();
	await createSession(token, userId);

	if (expoAddress) redirect = `${expoAddress}?session_id=${token}`;

	setSessionCookie(c, token);

	console.log("redirect", redirect, onReturn);

	if (onReturn === "sessionId")
		return c.json({
			sessionId: token,
		});
	else return c.redirect(redirect);
};

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

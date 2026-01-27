import { Context, Hono } from "hono";
import { handleUser, validateState } from "@/server/auth/config";
import { Google, generateCodeVerifier, generateState } from "arctic";
import { z } from "zod";
import { setCookie } from "hono/cookie";

const getGoogle = (c: Context) => {
	const expoAddress = c.req.query("expoAddress");
	return new Google(
		process.env.GOOGLE_CLIENT_ID!,
		process.env.GOOGLE_CLIENT_SECRET!,
		`${process.env.EXPO_PUBLIC_SITE_URL}/api/auth/google/callback${expoAddress ? `?expoAddress=${expoAddress}` : ""}`,
	);
};

export const googleHandler = new Hono()
	.get("/", async (c) => {
		const google = getGoogle(c);

		const state = generateState();
		const codeVerifier = generateCodeVerifier();

		const url: URL = google.createAuthorizationURL(state, codeVerifier, [
			"profile",
			"email",
		]);

		setCookie(c, "state", state, {
			secure: process.env.NODE_ENV === "production",
			path: "/",
			httpOnly: true,
			maxAge: 60 * 10, // 10 min
		});
		setCookie(c, "codeVerifier", codeVerifier, {
			secure: process.env.NODE_ENV === "production",
			path: "/",
			httpOnly: true,
			maxAge: 60 * 10, // 10 min
		});

		return c.redirect(url.toString());
	})
	.get("/callback", async (c) => {
		const google = getGoogle(c);

		const { code, codeVerifier } = await validateState(c, true);

		const tokens = await google.validateAuthorizationCode(
			code,
			codeVerifier,
		);

		// Get user email and googleId
		const response = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			},
		);
		const user: unknown = await response.json();
		const { sub: googleId, email } = z
			.object({
				sub: z.string(),
				email: z.string(),
			})
			.parse(user);

		return handleUser(c, { googleId, email });
	});

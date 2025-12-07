import { validateSessionToken } from "@recordscratch/auth";
import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

export const getSession = (c: Context) => {
	const query = c.req.query();
	return (
		(query.sessionId as string | undefined) ??
		c.req.header("Authorization") ??
		getCookie(c, "session")
	);
};

export const getAuth = async (c: Context) => {
	const sessionId = getSession(c);
	if (!sessionId) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	const { user, session } = await validateSessionToken(c, sessionId);
	if (!user || !session) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	return { user, session };
};

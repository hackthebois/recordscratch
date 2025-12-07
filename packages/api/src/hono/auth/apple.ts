import { decodeBase64IgnorePadding } from "@oslojs/encoding";
import { z } from "zod";
import { handleUser, validateState } from "@recordscratch/auth";
import { Apple, decodeIdToken, generateState } from "arctic";
import { Hono, Context } from "hono";
import { setCookie } from "hono/cookie";

const getApple = (c: Context) => {
  const expoAddress = c.req.query("expoAddress");
  const privateKey = decodeBase64IgnorePadding(
    process.env
      .APPLE_PRIVATE_KEY!.replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replaceAll("\r", "")
      .replaceAll("\n", "")
      .trim(),
  );
  return new Apple(
    process.env.APPLE_CLIENT_ID!,
    process.env.APPLE_TEAM_ID!,
    process.env.APPLE_KEY_ID!,
    privateKey,
    `${process.env.CF_PAGES_URL}/api/auth/apple/callback${expoAddress ? `?expoAddress=${expoAddress}` : ""}`,
  );
};

export const appleHandler = new Hono()
  .get("/", async (c) => {
    const apple = getApple(c);

    const state = generateState();
    const url = apple.createAuthorizationURL(state, ["email"]);
    url.searchParams.set("response_mode", "form_post");

    setCookie(c, "state", state, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 10, // 10 min
    });

    c.redirect(url.toString());
  })
  .get("/callback", async (c) => {
    const apple = getApple(c);

    const { code, formData } = await validateState(c, false);

    const email = (formData.get("email") as string) ?? undefined;

    const tokens = await apple.validateAuthorizationCode(code);
    const { sub } = decodeIdToken(tokens.idToken()) as { sub: string };

    return handleUser(c, { appleId: sub, email });
  })
  .post("/mobile/callback", async (c) => {
    const body = await c.req.json();

    const { idToken, email } = z
      .object({
        idToken: z.string(),
        email: z.string().optional(),
      })
      .parse(body);

    const { sub } = decodeIdToken(idToken) as { sub: string };

    return handleUser(c, {
      appleId: sub,
      email,
      onReturn: "sessionId",
    });
  });

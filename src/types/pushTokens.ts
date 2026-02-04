import { pushTokens } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const PushTokenSchema = createSelectSchema(pushTokens);
export type PushToken = z.infer<typeof PushTokenSchema>;

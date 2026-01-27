import { sessions } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const SessionSchema = createSelectSchema(sessions);
export type Session = z.infer<typeof SessionSchema>;

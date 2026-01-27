import { users } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const UserSchema = createSelectSchema(users);
export type User = z.infer<typeof UserSchema>;

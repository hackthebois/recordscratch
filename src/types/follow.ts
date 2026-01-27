import { followers } from "@/server/db";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const FollowSchema = createSelectSchema(followers);

export type Follow = z.infer<typeof FollowSchema>;

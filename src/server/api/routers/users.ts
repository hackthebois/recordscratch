import { users } from "@/server/db";
import { UserSchema } from "@/types";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
	me: publicProcedure.query(async ({ ctx: { db, userId } }) => {
		if (!userId) return null;
		return await db.query.users.findFirst({
			where: eq(users.id, userId),
		});
	}),
	update: protectedProcedure
		.input(UserSchema.pick({ notificationsEnabled: true }))
		.mutation(async ({ ctx: { db, userId }, input: { notificationsEnabled } }) => {
			return await db.update(users).set({ notificationsEnabled }).where(eq(users.id, userId));
		}),
});

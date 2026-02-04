import { z } from "zod";

export const SelectLikeSchema = z.object({
	resourceId: z.string(),
	authorId: z.string(),
});
export type SelectLike = z.infer<typeof SelectLikeSchema>;

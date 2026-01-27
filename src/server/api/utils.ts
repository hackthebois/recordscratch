import { z } from "zod";

export const PaginatedInput = z.object({
	cursor: z.number().min(0).optional(),
	limit: z.number().optional(),
});

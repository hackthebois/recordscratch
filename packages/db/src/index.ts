import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { relationSchemas, tableSchemas } from "./schema";

export * from "./schema";

const schema = {
	...tableSchemas,
	...relationSchemas,
};

// create the connection

export const getDB = () => {
	if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
	const sql = neon(process.env.DATABASE_URL);
	return drizzle(sql, { schema });
};
export type DB = ReturnType<typeof getDB>;

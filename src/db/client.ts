import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let cached: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase pooled connection string from Project Settings → Database → Connection pooling).",
    );
  }
  // `prepare: false` is required for Supabase's pooled connection (port 6543),
  // which runs PgBouncer in transaction mode and doesn't support prepared
  // statements. Direct connections (port 5432) accept prepared statements,
  // but on Vercel we always want the pooler to survive cold starts.
  const client = postgres(url, { prepare: false });
  cached = drizzle({ client, schema });
  return cached;
}

export { schema };

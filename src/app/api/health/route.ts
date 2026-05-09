import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getDb().execute(sql`select 1 as ok`);
    return Response.json({ ok: true, db: "connected", rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

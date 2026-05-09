import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

// `drizzle-kit generate` is offline (no DB needed). `migrate` / `push` / `studio`
// do need a real URL — we fall back to a placeholder so generate works without
// .env.local being filled in yet.
const url =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@placeholder/placeholder";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});

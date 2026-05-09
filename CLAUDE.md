# BragMe — agent notes

**Workflow:** Always commit on `main`. Push to `origin` after each completed numbered step. No feature branches.

**Stack pins:** Next 16.2, React 19, Tailwind v4, Anthropic SDK with model `claude-sonnet-4-6`, Supabase Postgres + Drizzle ORM via postgres.js (server-only via `DATABASE_URL`, use pooled connection on port 6543 with `prepare: false`).

**Next.js 16 caveat:** Read `node_modules/next/dist/docs/` for any API route / config / metadata change before relying on training data — there are breaking changes from Next 15.

**Dev server caveat:** This project lives at a path with non-ASCII characters (Korean `지안 작업`). Turbopack dev mode panics with `STATUS_DLL_INIT_FAILED (0xc0000142)` when spawning webpack-loader subprocesses on this path. `npm run dev` therefore uses `--webpack`. `npm run dev:turbo` is available for environments without the path issue. `next build` (production) still uses Turbopack and works fine.

**UX language:** All product UI copy is **English** (Gen-Z, main character energy). Talk to the user (PO) in **Korean**.

**Schema source of truth:** `src/db/schema.ts` (Drizzle). Generate migrations into `drizzle/` via `npm run db:generate`. Never hand-edit generated SQL.

**Don't bikeshed:** the spec in conversation memory is the canonical brief. Defer refactors and abstraction until the 9-step build is shippable end-to-end.

# BragMe

> Spill your mess. We'll find your magic.

A global Gen-Z web app: dump your messy self-description into a textarea, and AI turns it into a shareable Instagram-story-style **brag card**. No login. Watch one ad to browse the public feed.

## Stack

- **Framework:** Next.js 16.2 (App Router, TypeScript, React Compiler)
- **Styling:** Tailwind CSS v4
- **AI:** `@anthropic-ai/sdk` — `claude-sonnet-4-6`
- **Database:** Supabase Postgres (pooled connection) + Drizzle ORM via `postgres.js`
- **Card export:** `html-to-image` (PNG, 9:16 + 1:1)
- **Deploy:** Vercel

## Local dev

```bash
cp .env.local.example .env.local   # fill values
npm install
npm run dev          # webpack — works everywhere
npm run dev:turbo    # Turbopack — faster, but panics on paths with non-ASCII chars
```

The app degrades gracefully when secrets are missing:

| Missing env | What still works |
|---|---|
| `ANTHROPIC_API_KEY` | Form falls back to a local mock generator |
| `DATABASE_URL` | Reads/writes fall back to `MOCK_CARDS`; cards live in `sessionStorage` only |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limit + reaction dedupe fall back to per-instance memory (effectively off on serverless) |
| `IP_HASH_SALT` | A fixed dev salt is used; safe locally, set this in prod |
| `LEMON_PREMIUM_URL` | Premium CTA shows a "coming soon" placeholder |
| `NEXT_PUBLIC_BMC_USERNAME` | BMC widget hides itself |

## Required env vars

See \`.env.local.example\`. For full functionality you need:
- an Anthropic API key,
- a Supabase pooled \`DATABASE_URL\`,
- and an Upstash Redis pair (\`UPSTASH_REDIS_REST_URL\` + \`UPSTASH_REDIS_REST_TOKEN\`) plus an \`IP_HASH_SALT\` so rate limiting and reaction dedupe survive serverless cold starts.

All DB / Redis access is server-side via API routes — there are no \`NEXT_PUBLIC_\` credentials.

### Upstash Redis setup

1. [console.upstash.com](https://console.upstash.com) → **Create Database** (any region close to your Vercel deployment).
2. From the DB page → **REST API** → copy the \`UPSTASH_REDIS_REST_URL\` and \`UPSTASH_REDIS_REST_TOKEN\`.
3. Generate a random salt: \`openssl rand -hex 32\` → paste as \`IP_HASH_SALT\`.
4. Add all three to Vercel → Project Settings → Environment Variables for **Production** and **Preview**.

The free tier (10k requests/day) is plenty for early-stage traffic.

## Database setup

1. Supabase → New project (any region close to your users).
2. Project Settings → Database → **Connection pooling** → copy the **Transaction** mode connection string (port 6543).
3. Paste it into `.env.local` as `DATABASE_URL`.
4. Apply the migration:

   ```bash
   npm run db:migrate
   ```

   This runs `drizzle/0000_init.sql` against the database — creates the `color_theme` enum, the `cards` table, and indexes on `created_at desc` + `is_public`.
5. Smoke test:

   ```bash
   npm run dev
   curl http://localhost:3000/api/health
   # → {"ok":true,"db":"connected","rows":[{"ok":1}]}
   ```

## Deploy to Vercel

1. Push to GitHub (the project commits to `main` directly — no PR flow).
2. Vercel → New Project → import the repo.
3. Vercel sets the build command (`next build`) and output dir automatically. Node runtime is fine — no Edge config needed.
4. Project Settings → Environment Variables — add every key from `.env.local.example` for the **Production** environment:
   - `NEXT_PUBLIC_SITE_URL` — your production domain (e.g. `https://bragme.app`)
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` — Supabase pooled connection (port 6543)
   - `LEMON_PREMIUM_URL`, `LEMON_WEBHOOK_SECRET` (when ready)
   - `NEXT_PUBLIC_MONETAG_ZONE_ID`, `NEXT_PUBLIC_BMC_USERNAME` (optional)
5. After the first deploy: wire the Lemon Squeezy webhook to `https://<your-domain>/api/lemon/webhook` with `LEMON_WEBHOOK_SECRET` as the signing secret.

## Build plan (9 steps)

1. ✅ Next.js + Tailwind + base config
2. ✅ Supabase + Drizzle schema migration
3. ✅ `/api/generate` + Claude SDK
4. ✅ Main page (input form → result)
5. ✅ Card components (6 themes) + PNG download
6. ✅ `/card/[id]` + per-card OG metadata
7. ✅ `/feed` + rewarded ad gate
8. ✅ Cheer + rate limiting
9. ✅ Dynamic OG image + sitemap/robots + footer + Lemon webhook + Vercel deploy prep

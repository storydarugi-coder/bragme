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

## Required env vars

See `.env.local.example`. You need an Anthropic API key and a Supabase pooled `DATABASE_URL` to run end-to-end. All DB access is server-side via API routes — there are no `NEXT_PUBLIC_` DB credentials.

## Build plan (9 steps)

1. ✅ Next.js + Tailwind + base config
2. Supabase + Drizzle schema migration
3. `/api/generate` + Claude SDK
4. Main page (input form → result)
5. Card components (6 themes) + PNG download
6. `/card/[id]` + dynamic OG image
7. `/feed` + rewarded ad gate
8. Cheer + rate limiting
9. SEO + Vercel deploy prep

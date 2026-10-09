# SortTube 👀

A curated front page built from **your own real YouTube subscriptions**, automatically sorted into topic categories — instead of whatever YouTube's algorithm decides to surface.

**Live demo:** [sort-tube.vercel.app](https://sort-tube.vercel.app/)

## What it does

- **Sign in with Google**, grant read-only YouTube access, and SortTube pulls your actual subscriptions and recent uploads via the YouTube Data API.
- Every channel is automatically sorted into a category (News, Technology, AI, Education, Entertainment, Fitness, Podcasts, or a new category created on the fly) — no manual tagging required.
- **Guest Mode**: visit signed out and you still get a fully working dashboard, built from a fixed set of ~25 real YouTube channels, refreshed via a public API key (no login needed). Every feature works the same way as a signed-in account — nothing is faked or hardcoded.
- **On-demand AI summaries** for any video, generated only when you open it (not synced in bulk, to stay within free API quotas).
- **Manual recategorization** — move any channel to a different (or brand-new) category at any time.
- **Dark / light mode**, following your system preference by default with a manual override.

## How categorization works

Channels are categorized once, automatically, using **YouTube's own data — no AI guessing**:

1. **Podcast detection** — checks the channel's description and branding keywords for repeated podcast-related language.
2. **Keyword matching** — matches the channel's name and self-written branding keywords (not free-text description, to avoid false positives) against a curated rule set.
3. **YouTube topic data** — falls back to the `topicCategories` YouTube itself assigns the channel, matched against your existing categories or used to create a new one.

If none of the three layers can confidently decide, the channel is left to retry on the next sync rather than guessing — categorization should be explainable, not a black box.

A video always inherits its channel's current category, so recategorizing a channel immediately reclassifies all of its videos too.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4**, custom "playful geometric" design system (CSS-variable-driven theming, light/dark mode)
- **Prisma 7** (driver adapters) on **PostgreSQL** (Supabase)
- **Auth.js (next-auth v4)** with Google OAuth (`youtube.readonly` scope)
- **YouTube Data API v3** — OAuth client for signed-in users, API-key client for Guest Mode
- **Gemini** (primary) + **Groq** (fallback) for on-demand video summaries
- **Vitest** for unit tests (pure-function logic: categorization, formatting, theme toggling)
- Deployed on **Vercel**

## Getting started locally

```bash
git clone https://github.com/Rohini0518/SortTube.git
cd SortTube
npm install
```

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

You'll need:
- A Postgres database (e.g. a free [Supabase](https://supabase.com) project) for `DATABASE_URL`
- A Google Cloud OAuth 2.0 Client (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) with the YouTube Data API v3 enabled and the `youtube.readonly` scope on the consent screen
- A plain YouTube Data API v3 key for `YOUTUBE_API_KEY` (powers Guest Mode — no OAuth needed)
- A random string for `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- Optionally, `GEMINI_API_KEY` and/or `GROQ_API_KEY` for AI video summaries

Push the schema to your database, then start the dev server:

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page is at `/`, the actual app at `/dashboard`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run test` | Run the Vitest suite |
| `npm run lint` | Lint the codebase |

## Deployment

Deployed on Vercel, connected to this repo. The build runs `prisma generate` automatically via a `postinstall` script before `next build`. See `.env.example` for the full list of environment variables Vercel needs configured.

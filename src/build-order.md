# Build Order — Phased Sequence

This is the working sequence for turning the current mock-data prototype into
the real product described in `plan.md`. It's an execution checklist, not a
decision document — see `plan.md` for the actual architecture/why. Update
this file as phases complete or the sequence changes; it's not subject to the
"don't edit plan.md" rule since it's not `plan.md`.

## Phase 0 — Accounts & external setup
(you do these; I can guide/review but can't click through OAuth consent
screens or create Google accounts)

- Create the dedicated demo Google account (e.g. `newsprintRho@gmail.com`)
  and manually subscribe it to real channels covering every desk
  (tech/AI/frontend/backend/fullstack, education, sports,
  entertainment×3 languages, fashion, vlogs, trend, fitness).
- Google Cloud Console: new project → enable YouTube Data API v3 → configure
  OAuth consent screen (Testing mode) → create OAuth 2.0 Web client ID with
  a redirect URI (localhost for now, prod domain later).
- Provision a Postgres DB — Neon or Supabase free tier — grab the connection
  string.
- Get a Gemini API key (from Google AI Studio) — needed later for §9's AI
  summaries + chat agent, not blocking earlier work.

## Phase 1 — Backend foundation
(I build, once you hand me the Phase 0 credentials/env values)

- Add Prisma; define schema — `User`/`Account`/`Session` (Auth.js adapter
  shape) + `Subscription` + `Video` + `ChannelSnapshot` (per `plan.md` §5).
- Wire up Auth.js with the Google provider — `youtube.readonly` scope,
  `access_type=offline`, `prompt=consent`.
- You sign into the app once as the demo account (added as an OAuth test
  user) → I capture the resulting `userId` as `DEMO_USER_ID` in env.

## Phase 2 — Sync pipeline
(I build)

- Sync function: `subscriptions.list` → batched `channels.list` →
  `playlistItems.list`, writing `Subscription`/`Video`/`ChannelSnapshot`
  rows, keyed on `targetUserId` (never reading `session` directly inside the
  pipeline — see `.claude/skill.md`).
- Refresh-if-stale check (`lastSyncedAt` > ~24h) wired at the page/route
  level.
- Keyword/regex categorization at sync time, cached on `Video.category`.

## Phase 3 — Cut over from mock data
(I build)

- Replace `mock-data.ts`'s exported functions with Prisma-backed versions,
  same signatures — page/component layer shouldn't need changes.
- Feed `ChannelsManager`'s `initial` prop from real data; Add/Pause/Remove
  stay client-side only (unchanged).
- Header: Sign in / avatar+name based on session; logout → demo fallback +
  nudge copy.

## Phase 4 — AI features
(I build, needs the Gemini key from Phase 0)

- Per-video LLM summary (title+description → 4-line summary, cached on
  `Video.summary`).
- "Ask your feed" tool-calling chat agent, scoped strictly to the signed-in
  user's own `targetUserId`.

## Phase 5 — Ship

- Deploy (Vercel or similar), add prod redirect URI, whitelist test-user
  emails.
- Smoke-test both paths: signed-out (demo) and signed-in (real whitelisted
  account).

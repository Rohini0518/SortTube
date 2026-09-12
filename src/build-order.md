# Build Order — Phased Sequence

This is the working sequence for turning the mock-data prototype into the
real product described in `plan.md`, plus the follow-on features from
`smart-categorization.md`. It's an execution checklist, not a decision
document — see `plan.md` for the core architecture/why, and
`smart-categorization.md` for the reasoning behind Phases 5–6 specifically.
Update this file as phases complete or the sequence changes.

## Phase 0 — Accounts & external setup ✅ Done

- ✅ Demo Google account created and subscribed to real channels.
- ✅ Google Cloud project, YouTube Data API v3, OAuth consent screen
  (Testing mode), OAuth client ID.
- ✅ Postgres provisioned (Supabase).
- ✅ Gemini API key — confirmed working (see Phase 4).

## Phase 1 — Backend foundation ✅ Done

- ✅ Prisma schema (`User`/`Account`/`Session`/`VerificationToken` +
  `Subscription`/`Video`/`ChannelSnapshot`), pushed to Supabase.
- ✅ Auth.js wired up with Google, `youtube.readonly` scope,
  `access_type=offline` + `prompt=consent`.
- ✅ `DEMO_USER_ID` captured after a real, fully-linked sign-in.
- ✅ Branded `/signin` page, session-aware header (avatar/name/sign out,
  demo nudge), mobile nav parity.

## Phase 2 — Sync pipeline ✅ Done

- ✅ `subscriptions.list` → `channels.list` → `playlistItems.list` →
  `videos.list` (added for real duration/views — confirmed deviation from
  the original 3-step plan, see `plan.md` §6).
- ✅ Keyword/regex categorization at sync time, cached on `Video.category`.
- ✅ `ChannelSnapshot` append-only writes.
- ✅ Verified end-to-end against the real demo account (10 subscriptions,
  100 videos synced).

## Phase 3 — Cut over from mock data ✅ Done

- ✅ `mock-data.ts`'s exported functions rewritten to query Postgres via
  `resolveTargetUserId()` — same function signatures, zero page/component
  changes.
- ✅ Channels page automatically picked up real data as a side effect (no
  separate work needed — same function signature).
- ✅ Verified live: homepage, `/feed`, `/channels` all render real synced
  content for the demo account.

---

## Phase 4 — AI features & manual refresh (next up)

- ✅ **Verify `GEMINI_API_KEY`** — confirmed working via a live API call.
- ✅ **Manual "Refresh now" button** (`smart-categorization.md` item 4) —
  built on the Channels page, cooldown-guarded (5 min), verified live by
  clicking it (correctly showed the cooldown message on a recent sync).
  Also fixed an unrelated pre-existing bug found along the way:
  `ChannelsManager`'s hardcoded `CAPACITY = 10` cap no longer matched real
  subscription counts — removed, now just shows the real count.
- ✅ **Per-video AI summaries** (`plan.md` §9.1) — built, but with a real
  design change from the original plan: **generated on-demand via a
  "Summarize" button in the video modal, not automatically at sync time.**
  Discovered mid-build that Gemini's free tier caps this project at ~20
  requests/day — eager sync-time generation for all 100+ videos would burn
  nearly the whole daily budget on videos nobody opens. Also had to switch
  the model from `gemini-2.5-flash` (deprecated for new users, discovered
  live) to the `gemini-flash-latest` alias, to avoid this breaking again
  the next time Google rotates models. 12 videos got real summaries during
  testing before the daily quota was hit.
- [ ] **LLM categorization fallback** (`smart-categorization.md` item 1) —
  build alongside a future Gemini-related pass. **Must use the same
  per-sync budget cap lesson from the summaries work above** — this runs
  automatically during sync (not on-demand), so it's exposed to the same
  20/day risk if not capped.
- [ ] **"Ask your feed" chat agent** (`plan.md` §9.2) — tool-calling agent,
  scoped strictly to the signed-in user's own data, rate/cost-limited.

## Phase 5 — Smart categorization overhaul

Biggest architectural change of the two new phases — confirm the design
(especially the recategorization UI location) before writing code, per
`smart-categorization.md`.

- [ ] Design + add a per-user `Category` table (built-in 9 + user-added),
  and an override flag (e.g. `Video.categoryOverriddenByUser`) so manual
  choices survive future syncs.
- [ ] `getCategories()` becomes per-user instead of the static array —
  `Masthead` already takes `categories` as a prop, so the nav adapts
  automatically once this changes.
- [ ] Custom category creation UI.
- [ ] Manual recategorization UI + authenticated mutation endpoint —
  **signed-in users only**, never mutates the shared demo account (reverses
  part of `plan.md` §10's "read-only for everyone" stance, deliberately,
  for this feature only).
- [ ] Fallback icon for categories with no curated Lucide icon.

## Phase 6 — Ship

- [ ] Deploy (Vercel or similar) to a real domain.
- [ ] Add the production OAuth redirect URI.
- [ ] Publish a real privacy policy page + homepage description of what the
  app does and what data it accesses (both required for OAuth
  verification — `plan.md` §4).
- [ ] Record a short screen capture showing the `youtube.readonly` scope in
  use, if Google's review requests one.
- [ ] Submit for Google OAuth verification; flip publishing status to **In
  production** once approved — this is what unblocks real public sign-in
  for arbitrary users, not just whitelisted testers.
- [ ] Final end-to-end smoke test: signed-out (demo) and signed-in (a real
  account) on the live production deployment.

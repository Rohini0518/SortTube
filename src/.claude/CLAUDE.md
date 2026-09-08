@AGENTS.md
@projectInfo.md

# Sub Desk (product name: SortTube) — Project Rules

This file is read automatically at the start of every Claude Code session in
this repo. It holds the rules that must always apply — not conditional
guidance, not a reference doc. Keep it short; put deep detail in `plan.md`
and link to it instead of duplicating it here.

## Source of truth

- **`plan.md`** is the canonical architecture and roadmap document. Read it
  before any change that touches data flow, auth, or the sync pipeline.
- **`projectInfo.md`** is the original raw research (API quota math, provider
  tradeoffs). It's context for *why* `plan.md` says what it says — not itself
  authoritative if the two ever disagree. `plan.md` wins.
- If you're about to do something `plan.md` doesn't cover, don't guess —
  follow the confirmation rule below.

## Design system

- Current system: **Playful Geometric** (violet/pink/yellow/mint palette,
  Outfit + Plus Jakarta Sans, chunky 2px borders, hard offset "pop" shadows,
  pill buttons, blob-radius thumbnails, dot-grid background).
- This is **not locked**. If the user asks for a different look, change it —
  don't argue for preserving the current system out of consistency alone.
  Only push back if a request would visually break something functional
  (e.g. contrast/accessibility), not on taste grounds.

## Architecture ground rules (from `plan.md`)

- **Target-account resolution**: every data-fetching function resolves
  `targetUserId = session?.user.id ?? DEMO_USER_ID` before doing anything
  else. Signed in → the visitor's own synced data. Signed out → the demo
  account's real synced data. Same URLs and components serve both — never
  add a separate `/demo` route or fork a component based on demo-vs-real.
- **API-shaped data layer**: `mock-data.ts`'s exported functions
  (`getCategories`, `getFrontPageFeed`, `getActivityFeed`,
  `getTrackedCreators`, `getTrendingTicker`, `getFeaturedVideo`, etc.) are
  deliberately `async` and Promise-returning so the page/component layer
  never needs to change when they're swapped for real Prisma-backed queries.
  Preserve this shape in any new data function you add, even before the
  backend exists.
- **Quota discipline**: never call `search.list` (100 units/call — the #1
  quota trap). Sync path is `subscriptions.list` (paginated, 1 unit/page) →
  batched `channels.list` (≤50 IDs/call, 1 unit/call) → `playlistItems.list`
  per channel (1 unit/call). Budget is 10,000 units/day for the whole
  project, not per user.
- **Refresh-if-stale, no cron**: on page load, re-sync only if
  `lastSyncedAt` is older than ~24h, then serve from the DB. Don't add
  scheduled jobs/cron infrastructure unless `plan.md` is explicitly updated
  to call for it.
- **Categorization v1 is keyword/regex rules**, cached permanently on the
  `Video` row once computed. Don't reach for LLM classification — that's a
  deferred v2 in `plan.md`, not a default to fall back on for convenience.
- **Channels page**: Add / Pause / Remove are pure client-side state, no
  backend mutation, for every visitor including signed-in users, in v1.
  Don't wire these to real persistence or to YouTube's write API unless the
  user explicitly decides to move on the deferred item in `plan.md` §11.
- **Subscriber counts are conditional, not guaranteed.** YouTube's
  `channels.list` response sets `statistics.hiddenSubscriberCount: true` for
  channels that hide their count — in that case `statistics.subscriberCount`
  isn't reliable. When hidden, omit the "X subscribers" display for that
  channel entirely (don't guess, don't show a stale/fallback number, don't
  drop the whole channel). This is a per-channel display decision only —
  it does not change the OAuth scope, the sync pipeline, or anything else
  in `plan.md`.
- **No fabricated history**: subscriber "milestone" and "title change"
  activity types stay off until real `ChannelSnapshot`/title history exists.
  Don't synthesize a plausible-looking baseline to make the feature look
  done — `plan.md` explicitly rejected that.

## Hard process rules

1. **Additive by default.** When asked to add or fix one thing, do that —
   don't take it as license to also restyle, refactor, or "improve" other
   things nearby. If a fix genuinely requires touching something unrelated,
   say so and ask before doing it, don't just do it.
2. **No giant files.** Keep components small and single-purpose, following
   the existing folder pattern (`components/ui`, `components/editorial`,
   `components/content`, `components/layout`, `components/feed`,
   `components/channels`). A new feature earns new small files, not a bigger
   existing one.
3. **Every code file gets a header comment** stating, in a couple of lines,
   what the file does and where it fits in the app (e.g. "Renders one
   category desk on the home page; pulls tone/color from index for rotation
   — see CategorySection caller in app/page.tsx"). Add this on creation and
   keep it accurate when the file's role changes.
4. **Never fabricate realistic-looking data.** No invented view counts,
   subscriber numbers, quotes, or stats presented as if real and attributed
   to a real channel/person, unless clearly sourced (as was done for the
   real AI reference videos) or clearly and visibly labeled as illustrative
   placeholder data in the UI/comments.
5. **Don't edit `plan.md` for a new feature.** Build the feature; write a
   separate `<feature-name>.md` describing it if it needs its own notes.
   `plan.md` only changes when there's an explicit, confirmed decision that
   changes the actual plan — not as a running changelog of work done.
6. **Confirm before large architectural changes** — schema changes, auth
   flow changes, replacing a core pattern like the `targetUserId`
   resolution, changing the quota/sync strategy. Propose the change and
   wait for a yes before implementing it.
7. **Ask before starting any large new feature or addition**, even if it
   seems implied by `plan.md`. `plan.md` describes the intended shape of the
   product, not a queue of pre-approved work to start unprompted.

## Naming

- Product name is **SortTube** (renamed from the working prototype name
  "Sub Desk"). Some existing UI copy, file names, or comments may still say
  "Sub Desk" — update these opportunistically when you're already touching
  that file, not as a dedicated rename pass unless asked.
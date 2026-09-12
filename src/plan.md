# SortTube — Build Plan

Goal: turn the current mock-data Next.js demo into a real, working product —
a "smart YouTube homescreen" that pulls videos only from a user's
subscriptions and auto-buckets them into desks (News, Tech, Sports,
Education, Entertainment, Fashion, Vlogs, Trend, Fitness). It's a portfolio
piece, but that's not the ceiling — it's meant to genuinely work for real
users, not just look good to reviewers. Two things are both true and both
required:

- **Zero-login demoable**: anyone landing on the site with no account sees a
  fully populated experience via the demo account (see §3) — no sign-in wall
  blocking a first look.
- **Real public sign-in**: any real person should be able to sign in with
  their own Google account and get their own subscriptions sorted — not just
  a fixed list of manually-whitelisted testers. This means Google's OAuth
  verification (§4) is a committed target, not a deferred nice-to-have.

This file is the single source of truth for the plan. Update it as decisions
change — don't let it drift out of sync with reality.

---

## 1. Vision (from `projectInfo.md`)

> Subscription dashboard with category filtering — a "smart YouTube
> homescreen" that pulls videos only from channels you're subscribed to and
> auto-buckets them into Sports / Vlogs / Fashion / Education / AI / Trend /
> News.

Extended for this build: also Tech (beyond AI), Entertainment, Fitness — the
full `CategorySlug` set already defined in `src/lib/types.ts`.

## 2. Current state (as of this plan)

- Next.js 16 App Router, Tailwind v4, all UI already built: `/`, `/feed`,
  `/channels`.
- Everything is served from `src/lib/mock-data.ts` — static arrays, no
  backend, no auth, no database, identical for every visitor.
- The mock data layer is deliberately API-shaped (`getCategories`,
  `getFrontPageFeed`, `getActivityFeed`, `getTrackedCreators`,
  `getTrendingTicker`, `getFeaturedVideo` — all `async`, all returning
  Promises) specifically so it can be swapped for a real backend without
  touching the page/component layer.

## 3. The core architectural idea

Every data-fetching function resolves **one target account** before doing
anything else:

```
targetUserId = session?.user.id ?? DEMO_USER_ID
```

- Signed in → the visitor's own real, synced YouTube data.
- Not signed in → a dedicated demo account's real, synced YouTube data.

Same URLs (`/`, `/feed`, `/channels`) serve both cases — content just
switches based on whether there's a session. No separate `/demo` route, no
duplicate pages.

**The demo account is not special-cased in the sync pipeline.** It's a
regular authenticated user row in the database, whose OAuth grant was set up
once by manually signing into the app with the demo account, exactly like any
real user would. This keeps one single, uniform code path for syncing —
no demo-only branches anywhere in the backend logic.

### Why a dedicated demo account (not the builder's personal account)

A publicly deployed app permanently holds this account's OAuth refresh token
in the database. Using a personal account would mean a server/DB compromise
exposes real personal YouTube activity and ties public traffic's API usage to
a real identity. A throwaway account created solely for this project has zero
blast radius if anything ever goes wrong, and can be subscribed to exactly
the channels needed to populate every desk convincingly.

**Action:** create `newsprintRho@gmail.com` (or similar), and manually
subscribe it to real channels spanning every category the app supports:
tech (AI / frontend / backend / full-stack), education, sports,
entertainment (Hindi / Hollywood / Korean), fashion, vlogs, trend, fitness,
news. Every desk on the homepage needs at least a few real subscriptions
behind it.

## 4. Auth & session behavior

- **Provider:** Auth.js (NextAuth) with the Google provider — one OAuth flow
  gets both "logged in" state and a YouTube-scoped access token.
- **Scope:** `youtube.readonly` only. Not the broader read-write `youtube`
  scope — no feature currently requires mutating the user's real YouTube
  subscriptions (see §10, Channels page).
- **Token config:** `access_type=offline` + `prompt=consent` on first
  authorization, so a `refresh_token` is issued (not just a short-lived
  access token) — without this, YouTube access silently expires after ~1
  hour and the user would need to re-consent constantly.
- **Publishing status:** starts in Google's "Testing" mode for development
  (up to 100 whitelisted test-user emails — use this for your own account and
  reviewers while building). **Moving to "In production" is a committed
  goal**, not deferred — real users need to be able to sign in with their own
  Google accounts without being pre-approved one-by-one. Getting there
  requires:
  - A real, published privacy policy page (required by Google for any
    verified app).
  - A homepage clearly describing what the app does and what data it
    accesses.
  - Since `youtube.readonly` is a non-basic scope, likely a short screen
    recording showing how the app uses it (Google may require this during
    review).
  - Submitting through Google Cloud Console → Google Auth Platform for
    review. Turnaround is Google's timeline, not ours — typically days to a
    few weeks, so start this well before it's the last blocker to launch.
  - Until verification completes, the app still works correctly for the demo
    account and any whitelisted testers — verification blocks *arbitrary*
    public sign-in only, not the rest of the product.
- **No demo logout button.** The demo isn't a real session — there's nothing
  to log out of. There is only ever a "Sign in" affordance.
- **On real logout:** fall back to showing the demo automatically. Near the
  sign-in control, show a nudge such as *"You're viewing the demo — sign in
  to see your personalized dashboard."*

## 5. Data model (Prisma)

- `User`, `Account`, `Session` — mostly provided by the Auth.js Prisma
  adapter. `Account` already carries `access_token` / `refresh_token` /
  `expires_at` columns — no need to hand-roll token storage.
- `Subscription` — `userId`, `channelId`, `channelTitle`, `thumbnailUrl`,
  `uploadsPlaylistId`, `subscriberCount`, `category`, `subcategory?`,
  `lastSyncedAt`.
- `Video` — `youtubeVideoId`, `channelId`, `title`, `publishedAt`,
  `thumbnailUrl`, `durationLabel?`, `viewsLabel?`, `category`,
  `subcategory?`, `classifiedAt`, `summary?`, `summarizedAt?`.
- `ChannelSnapshot` — `channelId`, `subscriberCount`, `capturedAt`. Written
  on every sync run for every channel, starting from day one, regardless of
  whether the milestone UI is live yet (see §11). This is what lets
  "subscriber milestone" activity become possible later without any schema
  rework.

## 6. YouTube sync pipeline (quota-aware, per `projectInfo.md`)

Quota budget: 10,000 units/day, shared across the whole Google Cloud
project (not per user).

1. `subscriptions.list`, paginated 50/page → subscribed channel IDs.
   **1 unit per page.**
2. `channels.list`, batched up to 50 channel IDs per call → each channel's
   uploads playlist ID + metadata (title, thumbnail, subscriber count).
   **1 unit per call.**
3. `playlistItems.list` on each channel's uploads playlist → recent videos.
   **1 unit per channel.**
4. `videos.list`, batched up to 50 video IDs per call → each video's real
   duration (`contentDetails.duration`) and view count
   (`statistics.viewCount`), needed for the duration badge and the trending
   ticker's ranking. **1 unit per call**, same cost class as `channels.list`.
   Added after the original 3-step plan once the UI cutover (§Phase 3 in
   `build-order.md`) showed duration/views were required — confirmed
   decision, not scope creep.
5. **Never call `search.list`** — 100 units per call, the single biggest
   quota trap, for no benefit over the playlist approach above.

Rough cost: ~350–420 units for a full refresh of a 300-subscription account
(the added `videos.list` step contributes a small fraction of this).
Trivial against the daily budget even with real traffic hitting the refresh
path (see §7) many times a day.

Every sync run also writes a `ChannelSnapshot` row per channel (§5), and
runs new videos through classification (§8) before storing them.

## 7. Refresh strategy — no cron for v1

On every page load (server-side), resolve `targetUserId` (§3), then:

```
if (account.lastSyncedAt is older than ~24h) {
  run the sync pipeline for targetUserId before querying
}
serve data for targetUserId from the database
```

- No scheduled/cron infrastructure needed for v1 — traffic itself (demo
  visitors and real users alike) keeps data reasonably fresh, and the
  quota cost is negligible even at a ~24h refresh cadence.
- Accept that the one request which triggers a stale refresh will be
  slower (multiple sequential YouTube API calls) — fine for a portfolio
  project's traffic level. Revisit with a stale-while-revalidate pattern
  only if this becomes a real UX problem.

## 8. Categorization

- **v1:** keyword/regex rules against video title + channel name, mapped
  onto the existing `CategorySlug` set. Runs once per new video at sync
  time; result is cached on the `Video` row — never recomputed.
- **v2 (explicitly deferred):** LLM-based classification for the fuzzy
  cases (title alone often isn't enough for "Trend"), still cached per
  video ID so no video is ever classified twice. Costs money and adds
  latency — not needed for launch.
- Unmatched videos fall into a default/fallback bucket rather than being
  dropped.

## 9. AI features (LLMs & agents) — committed scope

Decided: this project should actually use an LLM and a real agent, not just
be an API-integration project. Two features are committed for launch; the
rest stay ideas for later (see §11).

### 9.1 AI video summaries (committed)

- Every video *can* get a **4-line LLM-generated summary**, stored on
  `Video.summary`. Once generated, cached forever (`summarizedAt` stamped
  so it's never regenerated) — same caching discipline as categorization
  in §8.
- **Generated on-demand, not automatically at sync time — a deliberate
  deviation from the original plan, confirmed during Phase 4.** Gemini's
  free tier caps out at a low daily request budget (observed: 20
  requests/day for the model in use), and most synced videos are never
  opened. Summarizing all of them eagerly at sync time would burn nearly
  the whole daily budget on videos nobody looks at. Instead, a "Summarize"
  button appears in the video modal only for videos without a summary yet;
  clicking it generates and caches one. See
  `src/lib/gemini/summarize-action.ts`.
- **v1 source: title + description only**, fetched fresh at click time via
  a single `videos.list` call (cheap against YouTube's quota, which isn't
  the constrained resource here — Gemini's request budget is). This is a
  "smart blurb," not a true content-grounded summary — worth being
  explicit about that distinction anywhere it's shown in the UI copy (e.g.
  don't call it a "transcript summary").
- **Stretch upgrade, not a launch requirement: transcript-based summary.**
  A real content summary needs the actual video transcript. YouTube's
  official Data API (`captions.download`) only grants transcript access
  for videos the *authenticated account itself owns* — not arbitrary
  third-party videos the demo account is merely subscribed to. Reaching
  real transcripts for other channels' videos means an unofficial method
  (community libraries reading YouTube's public auto-caption track), which
  works in practice for most public videos but sits outside what the
  official API guarantees and could break without warning. Only pursue
  this after the title+description version is shipped and working, and
  label it clearly as a best-effort enhancement if added.
- Surfaced in the UI as a replacement/generalization of the existing `dek`
  field concept (today only used on the single featured story) — extend it
  to appear per-video, e.g. in the video modal (`VideoModalProvider`) or an
  expandable section on a video card.

### 9.2 "Ask your feed" chat agent (committed)

- A chat interface, available to signed-in users, where they can ask
  natural-language questions about their own subscriptions — e.g. *"What
  did my tech channels post about agents this week?"* or *"Summarize my
  education desk."*
- This is a **real agent**, not a prompt template: the LLM decides which
  tool calls to make (e.g. "query videos in category X from the last 7
  days for this user," "look up a channel's recent upload history") and
  synthesizes the results into an answer — genuine tool-calling and
  reasoning over live data, which is what actually earns the word "agent"
  here.
- **Scope tool access strictly to the signed-in user's own `targetUserId`
  data.** Never let the agent query across users, and never expose it to
  anonymous demo visitors querying the shared demo account's data in ways
  that could be abused (rate-limit / cost-limit this endpoint).
- v1 scope: stateless per-session chat (conversation not persisted to the
  database). Persisting chat history is an easy later addition
  (`Conversation`/`Message` tables) but isn't needed to prove the feature
  works.
- Model choice is an implementation detail to settle when building this
  (e.g. Google Gemini via the Gemini API) — not a plan-level decision.

## 10. Channels ("manage subscriptions") page

- Initial list on load = real backend data — the target account's actual
  tracked subscriptions from the database (demo account's real subs, or
  the signed-in user's own).
- **Add / Pause / Remove stay exactly as they behave today: pure
  client-side state, no backend mutation, for every visitor (demo and
  signed-in alike) in v1.** This means the current `ChannelsManager`
  component needs no logic changes — only its `initial` prop changes from
  mock data to real backend data.
- This is deliberate: it lets anyone (including recruiters) freely
  interact with the page with zero risk of one visitor corrupting what the
  next visitor sees, and it defers a real decision (see §11) without
  blocking launch.

## 11. Explicitly deferred / open decisions

Revisit these later — not needed to ship a working, honest demo:

- **Real per-user channel persistence.** Should a signed-in user's own
  Add/Remove actions actually persist across sessions? If yes, this is an
  app-local "tracked channels" table, **not** a call to YouTube's
  `subscriptions.insert` — avoids needing the broader write scope and the
  OAuth review weight that comes with it.
- **Subscriber "milestone" activity type.** Not shown in v1 — there's no
  real history to diff against on day one, and fabricating a baseline
  snapshot was explicitly rejected in favor of honesty. `ChannelSnapshot`
  rows are being written from day one regardless, so this can be turned on
  later purely as a UI change once enough real history exists.
- **"Title change" activity type.** Needs a stored "first seen" title per
  video to diff future syncs against. Lower priority than milestones;
  build only if there's appetite after the core loop works.
- **LLM-based classification (v2).** See §8. Not committed like the §9
  features — a nice-to-have if keyword rules prove too coarse in practice.
- **Channel-curation agent.** A background agent that reviews sync history
  and `ChannelSnapshot` data to proactively suggest channels to add/remove.
  More build effort than the §9 features for less obvious payoff — only
  worth it once the two committed AI features are solid.
- **Self-checking classification agent.** Instead of one-shot
  categorization, an agent that classifies, checks its own confidence, and
  does a follow-up lookup before committing on low-confidence cases.
  Interesting technically, marginal user-facing value on top of §9.

Note: Full Google OAuth app verification was previously listed here as
deferred. It no longer is — see §4. Real public sign-in is a committed goal,
not a someday item.

## 12. Build checklist

- [ ] Create the dedicated demo Google account and subscribe it to real
      channels across every desk category.
- [ ] Google Cloud project: enable YouTube Data API v3, configure OAuth
      consent screen (Testing mode), create OAuth 2.0 Web client ID with
      the deployed domain's redirect URI.
- [ ] Provision Postgres (Neon or Supabase free tier).
- [ ] Add Prisma; define `User` / `Account` / `Session` (via Auth.js
      adapter) / `Subscription` / `Video` / `ChannelSnapshot`.
- [ ] Wire up Auth.js with the Google provider — `youtube.readonly` scope,
      `access_type=offline`, `prompt=consent`.
- [ ] Sign into the app once as the demo account (added as an OAuth test
      user) so it goes through the real auth flow; capture its resulting
      `userId` as the `DEMO_USER_ID` env var.
- [ ] Build the sync function (§6) plus the refresh-if-stale check (§7)
      keyed on `targetUserId` (§3).
- [ ] Build v1 keyword-based categorization (§8), run at sync time.
- [ ] Build AI video summaries (§9.1) into the sync pipeline, caching on
      `Video.summary`.
- [ ] Build the "Ask your feed" chat agent (§9.2), scoped to the signed-in
      user's own data only.
- [ ] Replace `mock-data.ts`'s exported functions with Prisma-backed
      versions using the same signatures and `targetUserId` resolution —
      page/component layer should need no changes.
- [ ] Feed `ChannelsManager`'s `initial` prop from real backend data; leave
      its Add/Pause/Remove behavior client-side only (§10).
- [ ] Header: Sign in control / avatar+name based on session; on logout,
      redirect home with the "see your personalized dashboard" nudge (§4).
- [ ] Deploy (Vercel or similar); add the production OAuth redirect URI;
      whitelist your own email + a couple of reviewers as OAuth test users.
- [ ] Smoke-test both paths end to end: signed-out (demo) and signed-in
      (a real whitelisted test account).
- [ ] Publish a real privacy policy page and a homepage description of what
      the app does and what data it accesses (both required for OAuth
      verification — see §4).
- [ ] Record a short screen capture showing the `youtube.readonly` scope
      being used, if Google's review requests one.
- [ ] Submit the app for Google OAuth verification via Google Cloud Console
      → Google Auth Platform, and move publishing status to "In production"
      once approved — this is what unblocks real public sign-in (§4).

## 13. Reference: current mock data note

`src/lib/mock-data.ts` currently has 9 real (oEmbed-verified) YouTube
channels/videos mixed into otherwise-fictional creators, added as a
temporary showcase step before this backend exists. Once §12 is complete,
this file's exported functions get replaced entirely by the real Prisma
-backed versions — none of its current content needs to carry forward.

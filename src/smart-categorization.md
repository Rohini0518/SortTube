# Smart Categorization & Manual Refresh — Feature Plan

This is a planning doc for four related features requested after Phase 3
shipped, once real synced data (e.g. "Travel with AK" landing in the `trend`
fallback bucket) exposed the limits of v1 keyword-only categorization. Not
part of `plan.md` (per `.claude/CLAUDE.md` rule: new features get their own
notes file, `plan.md` isn't edited for them) — but two of the four items
below are big enough that they need an explicit go-ahead before building,
same as any other large architectural change.

## The four items

1. **LLM-based categorization fallback** — already anticipated in `plan.md`
   §8 as an explicitly deferred "v2," not a new idea. This plan promotes it
   from deferred to committed.
2. **Manual recategorization** — move a misclassified video/subscription to
   a different desk. Not in `plan.md` at all.
3. **User-created custom categories** — add a brand-new desk beyond the
   fixed 9. Not in `plan.md` at all, and the biggest architectural change of
   the four.
4. **Manual "Refresh now" button** — force a sync on demand, alongside the
   existing automatic ~24h staleness check (`plan.md` §7, unchanged).

---

## 1. LLM categorization fallback

**Current behavior (v1, live today):** `src/lib/youtube/categorize.ts` runs
keyword/regex rules against title + channel name. No match → falls into
`trend` as a default bucket (`plan.md` §8's "don't drop it" rule).

**New behavior:** only when keyword rules find *no match*, call Gemini with
the video's title + channel name + the list of available categories (the
fixed 9, plus — once item 3 exists — the signed-in user's custom ones), and
ask it to pick the best fit.

- Keyword-matched videos are unaffected — still instant, free, no LLM call.
- Caching discipline is unchanged: classify once, stamp `classifiedAt`,
  never recompute (`.claude/skill.md`). The LLM call happens at most once
  per video, exactly like the keyword path today.
- Cost/rate impact is bounded to the minority of videos that don't match
  any keyword rule — but **don't assume that's automatically cheap enough**.
  Phase 4 discovered the real constraint: Gemini's free tier caps this
  project at ~20 requests/day total, shared across every AI feature. AI
  summaries were redesigned around this (generated on-demand via a button,
  never automatically at sync time — see `plan.md` §9.1). Categorization
  happens automatically during sync, not on-demand, so if more than a
  handful of videos per sync miss every keyword rule, this could just as
  easily exhaust the same daily budget the way the original eager-summary
  design did. **Needs the same kind of per-sync cap** (e.g. a handful of
  new LLM-categorization attempts per sync run, same pattern originally
  tried — and reverted — for summaries) before shipping this, not an
  afterthought.
- This reuses the same Gemini integration Phase 4's AI summaries need, so
  building this alongside Phase 4 (not before it) makes sense — one Gemini
  client setup serves both.

**Not a large architectural change** — no schema change beyond what item 3
already requires, no new UI. Safe to build without a separate confirmation
round, once Phase 4's Gemini wiring exists — but confirm the per-sync
budget cap approach specifically, given the lesson above.

---

## 2 & 3. Manual recategorization + custom categories

These two are grouped because #2's UI (a "move to..." control) is also
where #3's "or create a new one" option would live.

### Why this is a bigger change than it looks

`Video.category` and `Subscription.category` are already plain `String`
columns in Postgres (not a DB-level enum) — so the database itself doesn't
need to change to hold an arbitrary category value. The real constraint is
in code: `CategorySlug` (`src/lib/types.ts`) is a fixed TypeScript union of
exactly 9 values, and things like the icon lookup in `thumbnail.tsx`
(`CATEGORY_ICON: Record<CategorySlug, ...>`) are keyed off that fixed set.
Supporting custom categories means:

- **A new `Category` table** (per-user), holding both the 9 built-in
  defaults (seeded once) and anything a user adds — `id`, `userId`, `slug`,
  `name`, `standfirst`, `createdAt`.
- **`getCategories()` becomes per-user**, querying this table instead of
  returning the static array. (Good news: `Masthead` already takes
  `categories` as a prop rather than importing the static list directly, so
  the nav adapts automatically once `getCategories()` is dynamic — no nav
  code changes needed.)
- **A fallback icon** for any category without a hardcoded icon mapping
  (custom ones won't have a curated Lucide icon chosen for them).
- **An override flag** — e.g. `Video.categoryOverriddenByUser: Boolean` (or
  the same idea on `Subscription`) — so a user's manual choice survives the
  next sync instead of being silently reclassified back.
- **New authenticated mutation endpoints** — a server action or API route
  to (a) change a video's/subscription's category, (b) create a custom
  category. Both must be scoped strictly to the signed-in user's own data.

### The demo-account question

Per `plan.md` §10, the Channels page today is deliberately **read-only /
client-side-only** for every visitor, demo included — nobody's mutation
persists. Manual recategorization is a real backend write, so it has to be
**signed-in-users-only**: the shared demo account must not be mutable by
arbitrary anonymous visitors (same reasoning `plan.md` already uses for why
Add/Remove don't persist). This reverses part of §10's stance for
recategorization specifically, which is exactly the kind of decision
`CLAUDE.md` says to confirm before implementing, not assume.

### Where the UI lives (open question, not decided here)

Options worth weighing when we get to building this: a "Move to..." menu on
each video card, vs. recategorizing at the whole-subscription level on the
Channels page (simpler, but coarser — every video from that channel moves
together). Worth deciding deliberately rather than guessing.

**This pair is a large architectural change** — new schema, new mutation
surface, a reversal of an existing documented decision (§10), and a
fixed-type-to-dynamic-data change touching several components. Needs an
explicit go-ahead on the specific design (especially the UI location
question above) before writing code, not just this plan doc.

---

## 4. Manual "Refresh now" button

Additive to the existing automatic staleness check (`plan.md` §7) — not a
replacement. The auto-check stays as the baseline for visitors who never
click anything; the button is for anyone who wants fresher data
immediately (e.g. right after subscribing to a new channel on YouTube
itself).

- Calls the same `syncUserSubscriptions(userId)` pipeline that already
  exists (`src/lib/youtube/sync.ts`) — no new sync logic needed, just a new
  way to trigger it.
- **Needs a cooldown guard.** Quota is shared project-wide
  (10,000 units/day), and the demo account in particular could be
  refresh-spammed by many independent anonymous visitors clicking the same
  button. A simple rule: refuse to re-trigger if `lastSyncedAt` was within
  the last few minutes, same account-wide regardless of who clicks it.
- Small, self-contained — safe to build without a separate confirmation
  round.

---

## Suggested build order

1. **Item 4 (refresh button)** — smallest, fully independent, no schema
   change. Good first win.
2. **Item 1 (LLM fallback)** — build alongside Phase 4's Gemini setup for
   AI summaries, since both need the same client.
3. **Items 2 & 3 (recategorization + custom categories)** — biggest change;
   design the schema and UI location deliberately, confirm the approach,
   then build. Reasonable to sequence after Phase 4 ships, since it's the
   most speculative/open-ended of the four.

Nothing in this document has been built yet — it's the plan to confirm
against before starting any of the four items.

---
name: youtube-sync-pipeline
description: Reference for building, modifying, or debugging SortTube's YouTube sync pipeline — the code that pulls a user's subscriptions and videos from the YouTube Data API and writes them to the database. Use this whenever the user asks to add or change a synced field, touch subscriptions.list/channels.list/playlistItems.list, adjust categorization or caching logic, work with ChannelSnapshot or subscriber-count handling, debug quota usage, or investigate why synced data looks stale or wrong. Also use when adding any new data-fetching function to make sure it follows the existing async/Promise-returning shape.
---

# YouTube Sync Pipeline

Deep reference for the sync pipeline described in `plan.md` §§3, 5–8. Read
`plan.md` itself first if you haven't — this file is the "how," `plan.md` is
the "what and why." Don't duplicate decisions from `plan.md` here; if
something here seems to contradict it, `plan.md` wins and this file needs
updating.

## Call sequence and quota cost

Always in this order, never substituting `search.list` for any step:

1. **`subscriptions.list`** — paginated, 50/page, **1 unit per page**.
   Returns the channel IDs the target account follows.
2. **`channels.list`** — batch up to 50 channel IDs per call, **1 unit per
   call**. Use `part=snippet,statistics,contentDetails` to get, in one call:
   - `snippet.title`, `snippet.thumbnails` → channel display info
   - `statistics.subscriberCount` + `statistics.hiddenSubscriberCount` → see
     "Subscriber count handling" below, this is not optional to check
   - `contentDetails.relatedPlaylists.uploads` → the uploads playlist ID
     needed for step 3
3. **`playlistItems.list`** on each channel's uploads playlist — **1 unit
   per channel** — recent videos.
4. **Never call `search.list`.** 100 units/call for no benefit over the
   playlist approach above. If you find yourself reaching for it because
   "it's easier to filter this way," stop — restructure the query against
   data you already have instead.

Rough budget: ~300–350 units per full refresh of a 300-subscription account,
against a 10,000/day project-wide budget. This is cheap; don't add caching
layers or call-batching cleverness beyond what's described here to "save
quota" unless a real measurement shows a problem.

## Subscriber count handling

Every `channels.list` response includes `statistics.hiddenSubscriberCount`.
Check it:

```
if (statistics.hiddenSubscriberCount) {
  // Don't display a subscriber count for this channel. Not "0", not a
  // cached stale number, not omitting the whole channel — just no count.
} else {
  subscriberCount = statistics.subscriberCount
}
```

This is a per-channel condition, checked and stored at sync time
(`Subscription.subscriberCount` should be nullable to represent "hidden").
Don't fetch this separately or add a special-case API call for it — it's
already in the standard `channels.list` response from step 2 above.

## Caching discipline (never recompute)

Three things get computed once and stamped, never regenerated on subsequent
syncs:

- **Categorization** (`Video.category`/`subcategory`, `classifiedAt`) —
  keyword/regex rules against title + channel name, per `plan.md` §8. Only
  runs for videos that don't already have `classifiedAt` set.
- **AI summary** (`Video.summary`, `summarizedAt`) — per `plan.md` §9.1,
  from title + description only in v1. Only runs for videos that don't
  already have `summarizedAt` set.
- **`ChannelSnapshot`** rows are the one exception — these are *append-only*,
  a new row every sync run per channel, by design (this is what makes
  subscriber-milestone detection possible later without schema rework). Do
  not dedupe or upsert these; do not skip writing one because "nothing
  changed."

If you're ever tempted to add a `--force-reclassify` type flag or a reason
to recompute a cached field, stop and confirm with the user first — that's
a deliberate caching-cost decision from `plan.md`, not an oversight to fix.

## Target-account resolution

Every function in this pipeline is called with an explicit `targetUserId` —
never reads `session` directly itself. The `session?.user.id ?? DEMO_USER_ID`
resolution happens once, at the page/route level, per `plan.md` §3. Sync
functions and query functions just take `targetUserId` as a parameter. This
keeps the demo account on the exact same code path as a real user — no
`if (isDemo)` branches anywhere in this pipeline.

## Refresh-if-stale

```
if (account.lastSyncedAt is older than ~24h) {
  run steps 1–3 above for targetUserId, writing categorization/summary/
  snapshot as part of the same run
}
serve data for targetUserId from the database
```

No cron, no background queue, for v1 — see `plan.md` §7 for why. Don't add
scheduling infrastructure as part of unrelated sync-pipeline work; that's a
separate, larger decision covered by the "confirm before large architectural
changes" rule in `CLAUDE.md`.

## New data-fetching functions

Anything you add here should return a `Promise` and accept `targetUserId`
explicitly, matching the existing shape of `getCategories`,
`getFrontPageFeed`, `getActivityFeed`, `getTrackedCreators`,
`getTrendingTicker`, `getFeaturedVideo`. This is what lets `mock-data.ts` be
swapped for real Prisma-backed versions without the component layer
changing — don't break that shape for convenience.
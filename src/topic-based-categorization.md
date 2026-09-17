# Topic-Based Categorization — Final Plan

This replaces the AI-based channel-categorization fallback described in
`smart-categorization.md` item 1. That doc is now out of date on this point —
this file is the current source of truth for how a channel gets categorized
when its name doesn't match any keyword rule. Nothing here affects the
separate on-demand AI *video summary* feature (`plan.md` §9.1) — that stays
exactly as it is.

## Why this changed

The original plan was: keyword rules on the channel name first, then ask
Gemini to guess if that fails. Two problems showed up once this was tested
against a real account:

1. Gemini's free tier kept returning `503 — high demand` errors, and even
   with a Groq fallback added, it's still guessing — spending AI time/tokens
   to *infer* something YouTube may already know for a fact.
2. YouTube's Data API already tells us, for free, what topics a channel
   covers — no extra API call, no AI, no guessing needed for most channels.

So: stop guessing. Use YouTube's own signal first. Only if YouTube gives us
nothing usable does a channel stay in the `trend` bucket (same as today) —
there is no AI step in this pipeline at all anymore.

## The built-in categories (final list — 7, not 9)

**News, Tech, AI, Education, Entertainment, Fitness, Podcasts.**

Sports, Fashion, Vlogs, Trend, Music, and anything else aren't guaranteed to
exist for every account anymore — they only get created the first time a
real channel actually needs one, via the auto-create step below. `trend`
keeps its existing internal job as the "not yet decided" placeholder value
for a channel mid-pipeline — that doesn't change, it's just no longer
pre-seeded as a "real" desk up front.

Tech and AI are two separate categories, not one replacing the other — see
the layered rule below for how a channel ends up in one or the other.

## The new rule — three layers, checked in order (only runs for channels
still stuck at `trend`)

Already-categorized channels (matched by keyword, or manually moved by a
user via "Move to...") are never touched by this — it only applies to
channels where nothing has matched yet. Each layer only runs if the one
before it found nothing.

### Layer 1 — Podcast override (checked first, wins over everything)

YouTube has no structured "this is a podcast" field or topic — confirmed by
checking real data for two actual podcast channels (Andrew Huberman, Ranveer
Allahbadia): neither has anything in `topicCategories` that says "podcast."
But the literal word **does** show up reliably in the channel's own
description and self-written branding keywords — e.g. Huberman's
description literally says *"The Huberman Lab **podcast** is hosted
by..."*, and his branding keywords include `"health podcast"`.

So: search the channel's description + branding keywords for
"podcast"/"podcasts"/"podcasting". If found → category is **Podcasts**,
full stop — this is checked before subject-matter matching specifically so
it wins even when the channel's actual topic (health, entertainment,
whatever) would otherwise suggest something else.

### Layer 2 — Keyword matching (existing system, widened)

The existing keyword/regex rules (`categorize.ts`) currently only check the
channel's plain **name**. This widens that to also search the channel's
**description and branding keywords** — directly because a channel's name
rarely spells out what it's about, but its own self-written keywords often
do (e.g. Matt Wolfe's branding keywords are full of "AI," "ChatGPT,"
"Machine Learning" — none of that appears in the name "Matt Wolfe" itself).

The existing "AI" keyword rule — today a subcategory nested under Tech —
gets promoted to its own top-level category, and (since it's already
checked before the generic Tech rule in the rule list) naturally wins
whenever AI-specific language is present, falling through to plain Tech
otherwise. No separate "AI vs Tech" logic needed — this is just where the
rule already sat, given a top-level slug instead of a subcategory one.

### Layer 3 — Topic-based matching (only if Layers 1 and 2 both found nothing)

**Ask YouTube what it thinks the channel is about.** Add `topicDetails` to
the existing `channels.list` call in `sync.ts` (this call already happens
every sync — adding this part costs zero extra API quota). It returns a
list of Wikipedia-style topic links, e.g.:

```
https://en.wikipedia.org/wiki/Technology
https://en.wikipedia.org/wiki/Lifestyle_(sociology)
```

**Canonicalize.** Several of YouTube's topic labels are really the same
real-world thing: `Pop_music`, `Independent_music`, `Rock_music`,
`Soul_music`, and `Music_of_Asia` all just mean **Music**. Collapse these
down to one clean name per real concept before doing anything else — this
stops us from ever creating near-duplicate categories like "Pop Music" and
"Independent Music" side by side.

**Check against a small curated table of direct equivalences.** Only for
cases we're confident really are the same thing:

| YouTube topic | Our category |
|---|---|
| Technology | Tech |
| Health | Fitness |
| Politics | News |
| Tourism | Vlogs |
| Film | Entertainment |

If exactly **one** of the channel's canonical topics matches this table,
that's the category. Done.

**Ambiguous cases fall back to `trend`, never guessed.** Two situations
count as "ambiguous," and both just leave the channel in `trend` (to be
retried on a future sync, exactly like today's fallback behavior):

- Two or more of the channel's topics match **different** categories in the
  table above (e.g. both "Politics" and "Health" show up) — no confident
  single answer, so don't pick one arbitrarily.
- None of the topics match the table, **and** there's more than one leftover
  canonical topic with no way to confidently pick between them. (YouTube's
  topic order isn't stable between calls — confirmed by testing the same
  real channel twice and getting a different order back — so we deliberately
  never use "just take the first one" as a tiebreak.)

**Exactly one unmatched topic → auto-create a new category.** If nothing in
the table matched, but there's only **one** leftover canonical topic, that's
a confident, unambiguous signal — create a category for it (checking the
user's existing categories first, so multiple channels needing "Music"
share one category instead of each creating a duplicate). This is how real
categories like **Music**, **Society**, **Lifestyle**, or **Religion** come
into existence the first time a channel actually needs one — not decided in
advance, discovered from real data.

### Still nothing after all three layers

Stays `trend`, retried on the next sync — same fallback behavior as today.

## Categories move into the database — no more hardcoded list

Today, the built-in categories live as a hardcoded array in code, and only
custom/extra ones live in the `Category` database table. That split goes
away — **every category, built-in or not, becomes a row in the same
table**, scoped per user (your `Category` table already supports this exact
shape — no schema change needed).

- Every sync run makes sure a user has all 7 built-in rows (cheap,
  idempotent — inserts only the ones missing). This also automatically
  backfills any account that already exists today, the next time it syncs.
- Every place in the code that currently does "hardcoded array + database
  query, merged together" becomes a single, plain database query instead:
  `mock-data.ts`'s `getCategories()`, `sync.ts`'s available-categories list,
  both functions in `categories/actions.ts`, and `api/categories/route.ts`.
- `default-categories.ts` stops being "the live source of truth" everywhere
  and becomes just the one-time seed data used to create those 9 rows.

## Cleanup that comes with this

- The old per-sync AI-attempt budget cap (`MAX_NEW_CHANNEL_CATEGORIZATIONS_
  PER_SYNC`) is deleted — it only existed to protect a scarce AI quota,
  which no longer applies since there's no AI call in this pipeline anymore.
- `src/lib/gemini/categorize-channel.ts` becomes dead code once `sync.ts`
  stops calling it, and gets deleted.
- `src/lib/ai/generate-text.ts` (the Gemini+Groq fallback) and
  `src/lib/gemini/summarize.ts` are **not touched** — those belong to the
  separate on-demand AI video-summary feature and keep working exactly as
  they do today.
- `thumbnail.tsx`'s icon lookup is unaffected — built-in category slugs stay
  identical for every user, so existing icons keep matching; brand-new
  categories (Music, Society, etc.) still fall back to the generic icon
  already built for that purpose.

## Testing

A few new Vitest tests get added for the canonicalization + curated-table
matching logic (pure functions, no database involved) — same pattern as the
existing `categorize.test.ts` and `slugify.test.ts`.

## Build order (stopping for review after each, as usual)

1. Seeding: built-ins become database rows, idempotently ensured every sync.
2. Simplify every consumer to query the database directly (no more merging
   a hardcoded array in).
3. The new topic-based categorization logic itself (steps 1-5 above), wired
   into `sync.ts` in place of the old AI-fallback call.
4. Cleanup: delete the now-dead AI-categorization file, remove the budget
   cap, add tests.

Nothing in this document has been built yet — this is the plan to confirm
against before starting.

1. Quota — 10,000 units/day, free, and easy to stay well under if you're efficient

The trick is which endpoints you call:

subscriptions.list → 1 unit per page (50 results/page). Even 500 subscriptions = 10 units.
channels.list → 1 unit per call, and you can batch up to 50 channel IDs at once (to get each channel's "uploads" playlist ID).
playlistItems.list (on that uploads playlist) → 1 unit per channel, to get recent videos.
Avoid search.list entirely — it costs 100 units per call, 100x more expensive than the playlist approach for the same result. This is the #1 quota trap people fall into.
So even a user with 300 subscriptions costs you roughly ~300-350 units to do a full refresh. That's 3% of your daily free quota — you could refresh dozens of times a day for one user, or serve several users, before hitting the ceiling.

2. Reliability lever: cache in your DB, don't fetch live every page load

This is where Prisma earns its keep. Store subscriptions + recent videos with a lastSyncedAt timestamp. Serve the dashboard from your DB always; refresh in the background (a button, or a scheduled job every few hours) rather than hitting YouTube on every page visit. This makes the app feel fast and reliable even if YouTube's API has a hiccup or you're near quota — you just show slightly-stale cached data instead of erroring out.

3. OAuth — the "verification" step is free but is a process, plan around it

Keyword/rule-based classification on title + description + tags — cheap, fast, no extra API cost, but brittle (misses videos that don't use expected keywords, false-positives on clickbait titles).
LLM-based classification — send title/description (maybe channel name) to an LLM and ask it to bucket into your categories — most accurate, handles nuance ("Trend" is inherently fuzzy and time-sensitive), but costs money per video and adds latency, so you'd want to cache the classification per video ID rather than re-classify on every dashboard load.

my first idea:Subscription dashboard with category filtering — a "smart YouTube homescreen" that pulls videos only from channels you're subscribed to and auto-buckets them into Sports / Vlogs / Fashion / Education / AI / Trend / News.  ..

planning:

The core mechanism (this is the whole trick)
Every data-fetching function resolves one "target account" before doing anything else:


targetUserId = session?.user.id ?? DEMO_USER_ID
Signed in → their own real synced data.
Not signed in → the newsprintRho@gmail.com account's real synced data.
Same URLs (/, /feed, /channels), same components, same functions — just a different userId behind the scenes. This is exactly what you confirmed: no separate demo routes, no logout button for the demo (there's nothing to log out of — it's just the default unauthenticated state), and logging out of a real account naturally falls back to showing the demo again.

What "real, not mock" means concretely
You were clear: the displayed content (videos, categories, trending, activity) must come from a real backend synced against real YouTube data — not frontend mock arrays — so it stays accurate months later. That means:

Postgres (Neon/Supabase) + Prisma, storing Subscription and Video rows per account, each with lastSyncedAt.
The demo account is not special-cased in the sync code — it's a regular authenticated "user" row in your DB, just one whose OAuth grant you set up once yourself by signing into your own app with newsprintRho@gmail.com.
Refresh-if-stale, no cron: on any page load, if that target account's lastSyncedAt is older than ~24 hours, re-run the sync (subscriptions.list → batched channels.list → playlistItems.list) before serving. Cheap enough at ~300 units per sync that this costs nothing against the 10,000/day quota even with real traffic.
Channels page behavior
Initial list on load = the real backend data (demo account's or the signed-in user's actual tracked subscriptions from the DB).
Add / Pause / Remove clicks stay exactly as they work today — pure client-side state, nothing written back. Anyone (recruiter included) can play with it freely without risk of corrupting what the next visitor sees, and without needing new backend work for this page specifically.
For a signed-in real user, whether their own edits should actually persist is a separate future decision (an app-side "tracked channels" table, not a real YouTube subscribe call) — worth deciding once you're past the demo-account milestone, not blocking now.
Subscriber milestones — skipped for v1
You're right that there's no honest way to show a "milestone" on day one with zero history. Simplest move: don't ship that activity type yet. Still have the sync job write a subscriber-count snapshot every time it runs (cheap, one extra row) — so history quietly accumulates from day one, and you can turn the milestone UI back on later once there's real data to diff against, with zero backend rework needed at that point.

Concrete build order
Google Cloud setup — new project, enable YouTube Data API v3, OAuth consent screen (stays in "Testing" mode), OAuth client ID with your deploy domain's redirect URI.
Create newsprintRho@gmail.com and manually subscribe it to real channels spanning every desk you support (tech/ai/frontend/backend/fullstack, education, sports, entertainment/hindi/hollywood/korean, fashion, vlogs, trend, fitness, news) so every section of the homepage has genuine content.
Auth.js + Google provider, scope youtube.readonly, access_type=offline + prompt=consent (needed to get a refresh token, not just a short-lived access token).
Prisma schema: User/Account/Session (via the Auth.js adapter), Subscription, Video, ChannelSnapshot.
Sign into your own app once as newsprintRho@gmail.com (added as an OAuth test user) so it goes through the exact same real auth flow as any user — grab its resulting userId, store as DEMO_USER_ID env var.
Build the sync function + the "refresh if stale" check, using the targetUserId resolution above.
Rewrite mock-data.ts's functions to query Prisma via targetUserId instead of the static arrays — component layer shouldn't need to change.
Keyword-based categorization at sync time, cached on the Video row (LLM classification is a later upgrade, not needed for launch).
Header: Sign in / avatar+name based on session; on logout, redirect home with a nudge like "You're viewing the demo — sign in to see your personalized dashboard."
Deploy, add production redirect URI, whitelist your own email + a couple of trusted reviewers as OAuth test users so real sign-in is demoable to at least a few people before you'd ever need full Google verification.


NAV UI :

 default set of 6 for the nav, but customizable per user (they can swap which ones show), and this whole nav feature is on hold until the topic-based categorization work is fully built. I'll keep it noted for later; no action on it now.

That leaves the plan in src/topic-based-categorization.md as the next thing to actually build, starting with Step 1 (seeding built-ins into the database). Ready to start whenever you say go.
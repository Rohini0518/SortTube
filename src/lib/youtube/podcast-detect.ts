// Layer 1 of channel categorization (topic-based-categorization.md) —
// checked first, wins over everything else. YouTube has no structured
// "this is a podcast" field or topic — confirmed by checking real data for
// two actual podcast channels (Andrew Huberman, Ranveer Allahbadia):
// neither had anything in topicCategories that said "podcast." But the
// word itself shows up reliably in the channel's own description and
// self-written branding keywords, so that's what this checks instead.
//
// Requires 2+ mentions, not just 1 — a single incidental mention (e.g.
// Apple's description lists "Apple Podcasts" once, alongside many other
// product names — a false positive we hit live) isn't a reliable signal
// the channel itself IS a podcast. A channel that genuinely is one tends
// to say so repeatedly (Huberman: 4 mentions, Ranveer: 5).

const PODCAST_PATTERN = /\bpodcasts?\b|\bpodcasting\b/gi;

export function isPodcastChannel(description: string, brandingKeywords: string): boolean {
  const matches = `${description} ${brandingKeywords}`.match(PODCAST_PATTERN);
  return (matches?.length ?? 0) >= 2;
}

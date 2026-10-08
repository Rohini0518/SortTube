// Plain content data for the marketing landing page (app/page.tsx). Kept
// as typed data, separate from the JSX that renders it, specifically so it
// can be unit-tested (content.test.ts) without needing a component-testing
// setup. Every claim here should describe something the app actually does
// — see .claude/CLAUDE.md's "never fabricate" rule.

export interface Feature {
  title: string;
  body: string;
  icon: "sparkles" | "layout-grid" | "move" | "shield-check";
}

export const FEATURES: Feature[] = [
  {
    icon: "layout-grid",
    title: "Real subscriptions, auto-sorted",
    body: "Sign in and your actual YouTube subscriptions get filed into desks — News, Tech, Fitness, and more — decided from real signals (keywords, channel info, YouTube's own topic data), never a guess.",
  },
  {
    icon: "sparkles",
    title: "On-demand AI summaries",
    body: "Any video can get a short, honest summary generated from its title and description — only when you ask for one, so nothing is wasted summarizing videos nobody opens.",
  },
  {
    icon: "move",
    title: "Fix it yourself",
    body: "Automatic sorting won't always be perfect — move a channel to a different desk, or create your own category, any time.",
  },
  {
    icon: "shield-check",
    title: "Read-only, always",
    body: "SortTube only ever requests read-only access to your subscriptions — it can't post, subscribe, or change anything on your real YouTube account.",
  },
];

export interface ValueProp {
  icon: "timer" | "target" | "trophy";
  title: string;
  body: string;
}

export const VALUE_PROPS: ValueProp[] = [
  {
    icon: "timer",
    title: "Save time",
    body: "No more scrolling a shuffled feed to find what you actually follow.",
  },
  {
    icon: "target",
    title: "Just what you need",
    body: "Only your own subscriptions, sorted — nothing recommended, nothing pushed.",
  },
  {
    icon: "trophy",
    title: "Beat the algorithm",
    body: "Ranked by your desks, not by what keeps you watching longest.",
  },
];

export interface Step {
  title: string;
  body: string;
}

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    title: "You subscribe, same as always",
    body: "Nothing changes about how you follow channels. This just reads the list you already have.",
  },
  {
    title: "We sort it into desks",
    body: "Every channel is filed under a category — and a subcategory where it matters, like AI vs. frontend.",
  },
  {
    title: "You get an edition, not a feed",
    body: "Open to a front page organized like a paper, not a shuffled stream chasing watch time.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do I need to sign in to try it?",
    answer:
      "No — Guest Mode shows a real, curated set of channels across every desk, with no account and no sign-in required. Sign in only when you want your own subscriptions instead.",
  },
  {
    question: "What permissions does SortTube ask for?",
    answer:
      "Read-only access to your YouTube subscriptions, nothing else. SortTube can never post, subscribe, unsubscribe, or change anything on your real account.",
  },
  {
    question: "How does the sorting actually work?",
    answer:
      "Each channel is categorized from real signals — its name, its own self-written description and keywords, and YouTube's own topic data — never an AI guess. AI is used only for the optional, on-demand video summary feature.",
  },
  {
    question: "What if a channel ends up in the wrong desk?",
    answer:
      "Move it yourself any time, from the Channels page — your change is remembered and applied to that channel's videos going forward.",
  },
];

// The fixed channel list for the signed-out mock dashboard — provided
// directly by the project owner, categories hand-assigned (not run through
// keyword/topic categorization at all, unlike real accounts). See
// mock-dashboard/sync.ts for how this gets turned into real, refreshed data.

export interface MockSeedChannel {
  handle: string; // e.g. "@CodeWithHarry" — resolved to a real channel id on first sync
  category: string;
}

export const MOCK_SEED_CHANNELS: MockSeedChannel[] = [
  { handle: "@akshaymarch7", category: "education" },
  { handle: "@CodeWithHarry", category: "education" },
  { handle: "@VenkateshMogili", category: "education" },
  { handle: "@nitmonk", category: "ai" },
  { handle: "@ranveerallahbadia", category: "podcasts" },
  { handle: "@rajshamani", category: "podcasts" },
  { handle: "@nikhil.kamath", category: "podcasts" },
  { handle: "@tseries", category: "music" },
  { handle: "@zeemusiccompany", category: "music" },
  { handle: "@SonyMusicIndia", category: "music" },
  { handle: "@SonySportsNetwork", category: "sports" },
  { handle: "@FanCode", category: "sports" },
  { handle: "@StarSportsLive", category: "sports" },
  { handle: "@CarryMinati", category: "trend" },
  { handle: "@ashishchanchlanivines", category: "trend" },
  { handle: "@AmitBhadana", category: "trend" },
  { handle: "@BBCNews", category: "news" },
  { handle: "@ndtvindia", category: "news" },
  { handle: "@dhruvrathee", category: "news" },
  { handle: "@TaarunSGill", category: "fitness" },
  { handle: "@FitTuber", category: "fitness" },
  { handle: "@FitPanda", category: "fitness" },
  { handle: "@adityamovies", category: "entertainment" },
  { handle: "@GoldminesBollywood", category: "entertainment" },
  { handle: "@shemaroo", category: "entertainment" },
];

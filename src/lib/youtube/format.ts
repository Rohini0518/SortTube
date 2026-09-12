// Formats raw YouTube API values into the short display labels the existing
// UI already expects (e.g. ISO 8601 "PT4M13S" -> "4:13", 1100000 -> "1.1M").

export function formatDuration(iso: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return "0:00";

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${trimTrailingZero(count / 1_000_000)}M`;
  if (count >= 1_000) return `${trimTrailingZero(count / 1_000)}K`;
  return String(count);
}

function trimTrailingZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

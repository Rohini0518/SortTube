// Pure theme-toggle logic, kept separate from the DOM/localStorage-touching
// component (components/theme/theme-toggle.tsx) so it's unit-testable.
// THEME_STORAGE_KEY must stay in sync with the literal string in the
// blocking script in app/layout.tsx (that script runs before any JS
// bundle loads, so it can't import this constant).

export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "sorttube-theme";

export function toggleTheme(current: ResolvedTheme): ResolvedTheme {
  return current === "dark" ? "light" : "dark";
}

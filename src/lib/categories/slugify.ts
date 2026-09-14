/** Turns a category name into a URL-safe slug: lowercase, hyphenated,
 * punctuation stripped. Returns "" if nothing alphanumeric survives. */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

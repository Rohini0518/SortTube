// Display labels for the handful of built-in subcategories (e.g. "frontend"
// -> "Frontend"), used only by category-section.tsx's subcategory pill.
// Kept separate from Category/default-categories.ts on purpose: the
// Category database table has no subcategories column (categories now live
// fully in the database — see topic-based-categorization.md), and this is
// purely cosmetic label text, not data that needs to be queried or created
// per user.

import type { Subcategory } from "@/lib/types";

export const SUBCATEGORY_LABELS: Record<string, Subcategory[]> = {
  tech: [
    { slug: "frontend", name: "Frontend" },
    { slug: "backend", name: "Backend" },
    { slug: "fullstack", name: "Full-stack" },
  ],
  entertainment: [
    { slug: "hindi", name: "Hindi Cinema" },
    { slug: "hollywood", name: "Hollywood" },
    { slug: "korean", name: "Korean" },
  ],
};

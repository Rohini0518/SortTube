// Returns the current user's full category list (9 built-ins + their own
// custom ones, if signed in) — lets client components (the "Move to..."
// dropdown, the "+ New category" form) read the list without every server
// page having to pass it down as a prop.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/categories/default-categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const customCategories = userId ? await prisma.category.findMany({ where: { userId } }) : [];

  const categories = [
    ...DEFAULT_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, standfirst: c.standfirst })),
    ...customCategories.map((c) => ({ slug: c.slug, name: c.name, standfirst: c.standfirst })),
  ];

  return NextResponse.json({ categories });
}

// Returns the target account's full category list (built-ins + anything
// created since) — lets client components read the list without every
// server page having to pass it down as a prop. Reuses getCategories()
// directly so this always matches what every page already shows.

import { NextResponse } from "next/server";
import { getCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

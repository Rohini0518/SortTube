// Signed-in-only "+ New category" form (Channels page). On a name collision
// (with a built-in or one of the user's own categories), the server action
// returns the matching existing category instead of a flat error, and this
// shows a "use the existing one?" confirm instead of just failing.

"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCustomCategory } from "@/lib/categories/actions";
import type { Category } from "@/lib/types";

export function NewCategoryForm({ onCreated }: { onCreated: (category: Category) => void }) {
  const [name, setName] = useState("");
  const [standfirst, setStandfirst] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [collision, setCollision] = useState<Category | null>(null);

  function reset() {
    setName("");
    setStandfirst("");
    setError(null);
    setCollision(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !standfirst.trim()) return;
    setError(null);
    setCollision(null);
    startTransition(async () => {
      const result = await createCustomCategory(name, standfirst);
      if (result.ok) {
        onCreated(result.category);
        reset();
      } else if (result.reason === "collision") {
        setCollision(result.existingCategory);
      } else {
        setError(result.message);
      }
    });
  }

  if (collision) {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-card p-5">
        <p className="font-body text-sm text-foreground">
          <span className="font-heading font-bold">&ldquo;{collision.name}&rdquo;</span> already exists — use the
          existing category?
        </p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="primary" onClick={reset}>
            Yes, use it
          </Button>
          <Button type="button" variant="secondary" onClick={() => setCollision(null)}>
            No, rename mine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-4 sm:flex-row sm:items-start"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name (e.g. Travel)"
        className="min-w-0 flex-1 rounded-xl border-2 border-border bg-white px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6] focus:outline-none"
      />
      <input
        value={standfirst}
        onChange={(e) => setStandfirst(e.target.value)}
        placeholder="Short tagline (e.g. Places worth seeing)"
        className="min-w-0 flex-1 rounded-xl border-2 border-border bg-white px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6] focus:outline-none"
      />
      <Button type="submit" variant="secondary" disabled={isPending || !name.trim() || !standfirst.trim()}>
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        {isPending ? "Adding…" : "New category"}
      </Button>
      {error && <p className="w-full font-body text-xs text-secondary sm:w-auto">{error}</p>}
    </form>
  );
}

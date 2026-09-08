"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickAddCard({ used, capacity }: { used: number; capacity: number }) {
  const [value, setValue] = useState("");

  return (
    <Card shadow="yellow" className="p-5">
      <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
        <Plus className="h-5 w-5" strokeWidth={2.5} />
        Quick add channel
      </h3>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@channel or URL"
          className="min-w-0 flex-1 rounded-xl border-2 border-border bg-white px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add channel"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-secondary text-white pop-shadow"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </form>
      <p className="mt-3 font-body text-xs font-medium text-muted-foreground">
        {used} of {capacity} slots used
      </p>
    </Card>
  );
}

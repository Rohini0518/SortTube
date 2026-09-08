"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

const ROWS = [
  { label: "Views", suffix: "· Pro" },
  { label: "Activity types", suffix: "" },
  { label: "Channels", suffix: "· 0 selected" },
];

export function FiltersCard() {
  const [open, setOpen] = useState(true);

  return (
    <Card shadow="mint" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4"
      >
        <span className="flex items-center gap-2 font-heading text-lg font-extrabold text-foreground">
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2.5} />
          Filters
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="border-t-2 border-dashed border-border">
          {ROWS.map((row) => (
            <button
              key={row.label}
              type="button"
              className="flex w-full items-center justify-between border-b border-border px-5 py-3 text-left last:border-b-0 hover:bg-muted"
            >
              <span className="font-body text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label} {row.suffix}
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

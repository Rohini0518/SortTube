// "Refresh now" button for the Channels page — triggers refreshNow() (a
// server action) to force a sync immediately instead of waiting for the
// automatic ~24h staleness check. Shows a loading state and the server's
// success/cooldown message after clicking.

"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshNow } from "@/lib/youtube/refresh-action";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await refreshNow();
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        <RefreshCw className={isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} strokeWidth={2.5} />
        {isPending ? "Refreshing…" : "Refresh now"}
      </Button>
      {message && <span className="font-body text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}

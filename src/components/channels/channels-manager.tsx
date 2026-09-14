"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Pill } from "@/components/ui/pill";
import { ChannelRow } from "@/components/channels/channel-row";
import { NewCategoryForm } from "@/components/channels/new-category-form";
import type { Category, Creator } from "@/lib/types";

export function ChannelsManager({ initial, categories }: { initial: Creator[]; categories: Category[] }) {
  const [channels, setChannels] = useState(initial.map((c) => ({ ...c, paused: false })));
  const [categoryList, setCategoryList] = useState(categories);
  const [value, setValue] = useState("");
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);

  const addChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = value.trim().replace(/^@/, "");
    if (!handle) return;
    const name = handle
      .split(/[-_.]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const newCreator: Creator & { paused: boolean } = {
      id: `c-custom-${Date.now()}`,
      name,
      monogram: handle.slice(0, 2).toUpperCase(),
      category: "trend",
      subscriberLabel: "—",
      paused: false,
    };
    setChannels((prev) => [newCreator, ...prev]);
    setValue("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl font-body text-base text-muted-foreground">
          Add channels by handle (<span className="font-semibold text-foreground">@mkbhd</span>), URL, or channel ID.
          We watch them and sort their uploads into your desks.
        </p>
        <Pill tone="violet">
          {channels.length} tracked
        </Pill>
      </div>

      <form onSubmit={addChannel} className="mt-6 flex flex-col gap-3 rounded-2xl border-2 border-foreground bg-card p-4 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@mkbhd or https://youtube.com/@mkbhd"
          className="min-w-0 flex-1 rounded-xl border-2 border-border bg-white px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:shadow-[4px_4px_0px_0px_#8B5CF6] focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border-2 border-foreground bg-secondary px-6 py-3 font-heading text-sm font-bold text-white pop-shadow disabled:opacity-40"
        >
          Add channel
        </button>
      </form>

      {isSignedIn && (
        <div className="mt-4">
          <NewCategoryForm onCreated={(category) => setCategoryList((prev) => [...prev, category])} />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {channels.map((creator) => (
          <ChannelRow
            key={creator.id}
            creator={creator}
            categories={categoryList}
            paused={creator.paused}
            onTogglePause={() =>
              setChannels((prev) => prev.map((c) => (c.id === creator.id ? { ...c, paused: !c.paused } : c)))
            }
            onRemove={() => setChannels((prev) => prev.filter((c) => c.id !== creator.id))}
            onRecategorized={(newCategory) =>
              setChannels((prev) =>
                prev.map((c) => (c.id === creator.id ? { ...c, category: newCategory } : c)),
              )
            }
          />
        ))}
        {channels.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-border p-8 text-center font-body text-sm text-muted-foreground">
            No channels tracked yet — add one above.
          </p>
        )}
      </div>
    </div>
  );
}

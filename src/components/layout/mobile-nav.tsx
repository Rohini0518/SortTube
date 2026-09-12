"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/layout/auth-button";
import type { Category } from "@/lib/types";

export function MobileNav({
  categories,
  navLinks,
}: {
  categories: Category[];
  navLinks: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-card"
      >
        {open ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b-2 border-foreground bg-background p-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 font-heading text-base font-bold text-foreground hover:bg-tertiary/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="my-3 h-0.5 rounded-full bg-border" />
          <nav aria-label="Categories" className="flex flex-col divide-y divide-border">
            {categories.map((c) => (
              <a
                key={c.slug}
                href={`/#${c.slug}`}
                onClick={() => setOpen(false)}
                className="px-3 py-3 font-body text-sm font-semibold text-muted-foreground"
              >
                {c.name}
              </a>
            ))}
          </nav>
          <Link href="/channels" onClick={() => setOpen(false)} className="mt-3 block">
            <Button variant="secondary" className="w-full">
              Manage subscriptions
            </Button>
          </Link>
          <div className="mt-3 flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}

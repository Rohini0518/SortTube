import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthButton } from "@/components/layout/auth-button";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/channels", label: "Channels" },
];

const CATEGORY_TONES = ["hover:text-accent", "hover:text-secondary", "hover:text-tertiary", "hover:text-quaternary"];

export function Masthead({ categories }: { categories: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="group">
          <span className="block font-body text-sm font-semibold italic text-secondary">
            the daily sub <span className="not-italic">👀</span>
          </span>
          <span className="block font-heading text-3xl font-extrabold tracking-tight text-foreground">
          Sort Tube
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-heading text-sm font-bold text-foreground hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/channels">
            <Button variant="secondary">Manage subscriptions</Button>
          </Link>
          <AuthButton />
        </div>

        <MobileNav categories={categories} navLinks={NAV_LINKS} />
      </div>

      <nav
        aria-label="Categories"
        className="mx-auto hidden max-w-6xl overflow-x-auto px-4 pb-4 sm:flex sm:gap-5 sm:px-6"
      >
        {categories.map((c, i) => (
          <a
            key={c.slug}
            href={`/#${c.slug}`}
            className={`whitespace-nowrap font-body text-sm font-semibold text-muted-foreground ${CATEGORY_TONES[i % CATEGORY_TONES.length]}`}
          >
            {c.name}
          </a>
        ))}
      </nav>
    </header>
  );
}

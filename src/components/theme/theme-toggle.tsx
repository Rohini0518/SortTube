// Light/dark toggle shown in Masthead, MobileNav, and LandingHeader.
// Defaults to the visitor's system preference (handled purely in CSS — see
// globals.css) until they click this, at which point their choice is
// saved and overrides the system setting from then on.
// Checked = dark (moon/stars), unchecked = light (sun/sky) — styling lives
// in the .sun-moon-* rules in globals.css.

"use client";

import { useEffect, useId, useState } from "react";
import { toggleTheme, THEME_STORAGE_KEY, type ResolvedTheme } from "@/lib/theme/toggle-theme";

export function ThemeToggle() {
  const id = useId();
  // Starts null so the server-rendered placeholder and the client's first
  // render match exactly (avoids a hydration mismatch) — resolved to the
  // real current theme a tick after mount instead.
  const [theme, setTheme] = useState<ResolvedTheme | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") {
      setTheme(attr);
      return;
    }
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function handleChange() {
    const next = toggleTheme(theme ?? "light");
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  if (theme === null) {
    return <span className="inline-block h-[50px] w-[90px] shrink-0" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <div className="shrink-0">
      <input
        className="sun-moon-input"
        id={id}
        type="checkbox"
        checked={isDark}
        onChange={handleChange}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
      <label className="sun-moon-toggle" htmlFor={id}>
        <span className="sun-moon-handler">
          <span className="sun-moon-crater sun-moon-crater--1" />
          <span className="sun-moon-crater sun-moon-crater--2" />
          <span className="sun-moon-crater sun-moon-crater--3" />
        </span>
        <span className="sun-moon-star sun-moon-star--1" />
        <span className="sun-moon-star sun-moon-star--2" />
        <span className="sun-moon-star sun-moon-star--3" />
        <span className="sun-moon-star sun-moon-star--4" />
        <span className="sun-moon-star sun-moon-star--5" />
        <span className="sun-moon-star sun-moon-star--6" />
      </label>
    </div>
  );
}

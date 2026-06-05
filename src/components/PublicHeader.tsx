"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  ["Tools", "/tools"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function PublicHeader({ siteName = "CreatorTools.in" }: { siteName?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ct-theme");
    if (stored === "dark") document.documentElement.classList.add("dark");
  }, []);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("ct-theme", isDark ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-sm text-white">CT</span>
          <span>{siteName}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-[var(--muted)] md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[var(--foreground)]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button className="btn-secondary !min-h-10 !px-3" onClick={toggleTheme} type="button" aria-label="Toggle dark mode">
            ◐
          </button>
          <Link className="btn-primary !min-h-10" href="/tools">
            Find a tool
          </Link>
        </div>
        <button className="btn-secondary md:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
          ☰
        </button>
      </div>
      {open ? (
        <div className="border-t border-[var(--border)] md:hidden">
          <div className="container grid gap-2 py-3">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-lg px-2 py-3 font-bold" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <button className="btn-secondary" onClick={toggleTheme} type="button">
              Toggle dark mode
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

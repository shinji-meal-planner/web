"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Weight-goal planner" },
  { href: "/budget", label: "Budget planner" },
];

export function SiteNav() {
  const path = usePathname();
  return (
    <nav className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-3xl gap-1 overflow-x-auto px-4 py-2">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${active ? "bg-good-soft text-good" : "text-muted hover:text-foreground"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

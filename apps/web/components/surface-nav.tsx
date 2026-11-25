"use client";

import Link from "next/link";
import { NavIcon } from "@/components/nav-icon";
import { usePathname } from "next/navigation";
import { publicPath } from "@/lib/public-path";

type NavItem = { href: string; label: string };

export function SurfaceNav({ items, vertical = false, compact = false }: { items: readonly NavItem[]; vertical?: boolean; compact?: boolean }) {
  const path = publicPath(usePathname() || "/");

  return (
    <nav aria-label="Secciones" className={vertical ? "flex flex-col gap-1" : "flex flex-wrap gap-2"}>
      {items.map((item) => {
        const active = item.href === "/" ? path === "/" : (path === item.href || (item.href !== "/admin" && path.startsWith(`${item.href}/`)));
        return (
          <Link
            key={item.href}
            href={item.href}
            title={compact ? item.label : undefined}
            aria-label={compact ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={`flex items-center ${compact ? "justify-center px-2" : "gap-3 px-3"} rounded-lg py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              active ? "bg-sky-400/20 text-sky-200 ring-1 ring-inset ring-sky-300/30" : "text-slate-300 hover:bg-sky-400/10 hover:text-white"
            }`}
          >
            {vertical && <NavIcon href={item.href} />}<span className={compact ? "sr-only" : undefined}>{item.label}</span>{vertical && !compact && <svg aria-hidden="true" className="ml-auto text-slate-500" width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </Link>
        );
      })}
    </nav>
  );
}

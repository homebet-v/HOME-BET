"use client";

import Link from "next/link";
import { NavIcon } from "@/components/nav-icon";
import { usePathname } from "next/navigation";
import { homeSections } from "@/lib/nav";
import { publicPath } from "@/lib/public-path";

function isCurrent(path: string, href: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function HomeNav() {
  const path = publicPath(usePathname() || "/");

  return (
    <nav aria-label="Fábrica" className="flex flex-col gap-5 px-3 py-2">
      {homeSections.map((section) => (
        <div key={section.label ?? "resumen"} className="flex flex-col gap-1">
          {section.label ? (
            <p className="px-3 pb-1 text-[11px] tracking-[0.16em] text-slate-400 uppercase">
              {section.label}
            </p>
          ) : null}
          {section.items.map((item) => {
            const active = isCurrent(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  active
                    ? "border-sky-300 bg-sky-400/20 text-sky-100 ring-1 ring-inset ring-sky-300/20"
                    : "border-transparent text-slate-300 hover:bg-sky-400/10 hover:text-white"
                }`}
              >
                <NavIcon href={item.href} />{item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function HomeNavFallback() {
  return (
    <nav aria-label="Fábrica" className="flex flex-col gap-5 px-3 py-2">
      {homeSections.map((section) => (
        <div key={section.label ?? "resumen"} className="flex flex-col gap-1">
          {section.label ? (
            <p className="px-3 pb-1 text-[11px] tracking-[0.16em] text-slate-400 uppercase">
              {section.label}
            </p>
          ) : null}
          {section.items.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-300">
              <NavIcon href={item.href} />{item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

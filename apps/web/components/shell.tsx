import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { SurfaceNav } from "@/components/surface-nav";

type NavItem = { href: string; label: string };

export function Shell({
  eyebrow,
  title,
  nav,
  children,
}: {
  eyebrow: string;
  title: string;
  nav: readonly NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#0d121b]">
      <header className="border-b border-white/[0.07] bg-[#101620]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-semibold tracking-tight text-slate-200">Homebet</p>
            <p className="text-xs tracking-wide text-zinc-500">{eyebrow}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold tracking-tight">{title}</p>
            <p className="text-[10px] text-slate-500">Entorno de demostración</p>
          </div>
          <Suspense fallback={<NavFallback items={nav} />}>
            <SurfaceNav items={nav} />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1320px] min-w-0 flex-1 flex-col gap-6 px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}

function NavFallback({ items }: { items: readonly NavItem[] }) {
  return (
    <nav aria-label="Secciones" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-300"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

import type { CSSProperties } from "react";
import Link from "next/link";
import "./player-profile.css";
import { PlatformLogin, SignOut } from "@/components/platform-login";
import { palettes, type Appearance } from "@/lib/appearance";

const amount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const chips = (cents: number) => `${amount.format(cents / 100)} fichas`;

export function PlayerLogin({ appearance }: { appearance: Appearance }) {
  const palette = palettes[appearance.palette];
  return <section className="mx-auto max-w-md space-y-4 px-4 py-8 text-white" style={{
    "--access-accent": palette.accent,
    "--access-ink": palette.ink,
    "--access-line": `color-mix(in srgb, ${palette.accent} 35%, transparent)`,
  } as CSSProperties}>
    <h1 className="text-2xl font-bold">Ingresar</h1>
    <p className="text-sm leading-6 text-slate-300">Entrá con tu CI para ver tu saldo, cargar fichas y jugar.</p>
    <PlatformLogin player />
  </section>;
}

export function PlayerProfile({
  name, ci, label, detail, tone, totalCents, withdrawableCents, depositNote, primary, links, accent, ink,
}: {
  name: string;
  ci: string;
  label: string;
  detail: string;
  tone: "ok" | "wait" | "stop";
  totalCents: number | null;
  withdrawableCents: number | null;
  depositNote: string | null;
  primary: { href: string; label: string };
  links: readonly { href: string; label: string; hint: string }[];
  accent: string;
  ink: string;
}) {
  const toneClass = tone === "ok" ? "border-transparent bg-[#00c853] text-black" : tone === "stop" ? "border-red-300/30 text-red-200" : "border-amber-200/30 text-amber-100";
  const initial = name.trim().slice(0, 1).toUpperCase() || "J";
  return <section className="mx-auto max-w-lg space-y-4 px-4 pt-3 text-white">
    <h1 className="sr-only">{name}{ci ? `, CI ${ci}` : ""}</h1>
    {tone !== "ok" ? <><p className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>{label}</p><p className="text-sm leading-6 text-slate-200">{detail}</p></> : null}
    {totalCents !== null && withdrawableCents !== null && <div className="rounded-[6px] border border-white/10 bg-black p-4">
      <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/50 text-sm font-semibold">{initial}</span>
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5"><span className="truncate text-base font-semibold">{name}</span>{tone === "ok" ? <span title="Cuenta verificada" aria-label="Cuenta verificada" className="grid size-4 shrink-0 place-items-center rounded-full bg-[#00c853]"><svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.2 4.7 8.7 9.8 3.3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span> : null}</p>
          {ci ? <p className="text-xs text-slate-300">CI {ci}</p> : null}
        </div>
      </div>
      <p className="text-xs text-slate-400">Saldo para jugar</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{amount.format(totalCents / 100)} <span className="text-base font-normal text-slate-300">fichas</span></p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border border-white/10 p-3">
          <dt className="text-xs text-slate-400">Para retirar</dt>
          <dd className="mt-1 font-semibold tabular-nums">{chips(withdrawableCents)}</dd>
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <dt className="text-xs text-slate-400">Solo para jugar</dt>
          <dd className="mt-1 font-semibold tabular-nums">{chips(totalCents - withdrawableCents)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-5 text-slate-400">Las cargas y los bonos se usan primero para jugar. Los premios quedan disponibles para retirar.</p>
    </div>}
    {depositNote ? <p className="rounded-xl border border-amber-200/30 bg-black/30 p-3 text-sm leading-6">{depositNote}</p> : null}
    <div className="grid gap-2">
      <Link href={primary.href} className={`relative flex min-h-11 items-center justify-center overflow-hidden px-4 text-sm font-bold ${primary.href === "/cargar" ? "rounded-[6px]" : "rounded-xl"}`} style={primary.href === "/cargar" ? { background: "linear-gradient(180deg, #3dff86 0%, #00c853 46%, #067a34 100%)", color: "#000" } : { background: accent, color: ink }}>{primary.href === "/cargar" ? <span className="load-chip-shine" aria-hidden="true" /> : null}<span className="relative z-10">{primary.label}</span></Link>
      {links.map((link) => <Link key={link.href} href={link.href} className="rounded-[6px] border border-white/10 bg-black px-4 py-3 text-sm">
        <span className="block font-semibold">{link.label}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{link.hint}</span>
      </Link>)}
    </div>
    <SignOut />
  </section>;
}

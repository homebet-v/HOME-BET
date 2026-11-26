import type { CSSProperties } from "react";
import Link from "next/link";
import "./player-profile.css";
import { CopyIdentity } from "@/components/copy-identity";
import { PlatformLogin, SignOut } from "@/components/platform-login";
import { palettes, type Appearance } from "@/lib/appearance";

const icon = "shrink-0";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function RowGlyph({ href }: { href: string }) {
  if (href === "/saldo") return <svg className={icon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M7 7h11M14.5 4.5 17 7l-2.5 2.5M17 17H6M9.5 14.5 7 17l2.5 2.5" /></svg>;
  if (href === "/verificacion") return <svg className={icon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M6 16.2a3 3 0 0 1 6 0M14 10h4M14 14h3" /></svg>;
  return <svg className={icon} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M12 13v3.5M10.2 14.7h3.6" /></svg>;
}

const amount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });
const chips = (cents: number) => `${amount.format(cents / 100)} fichas`;

export function PlayerLogin({ appearance, lead }: { appearance: Appearance; lead?: string }) {
  const palette = palettes[appearance.palette];
  return <section className="mx-auto max-w-md space-y-4 px-4 py-8 text-white" style={{
    "--access-accent": palette.accent,
    "--access-ink": palette.ink,
    "--access-line": `color-mix(in srgb, ${palette.accent} 35%, transparent)`,
  } as CSSProperties}>
    <h1 className="text-2xl font-bold">Ingresar</h1>
    <p className="text-sm leading-6 text-slate-300">{lead ?? "Entrá con tu CI para ver tu saldo, cargar fichas y jugar."}</p>
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
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5"><span className="truncate text-base font-semibold">{name}</span>{tone === "ok" ? <span title="Cuenta verificada" aria-label="Cuenta verificada" className="grid size-4 shrink-0 place-items-center rounded-full bg-[#00c853]"><svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.2 4.7 8.7 9.8 3.3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span> : null}</p>
          {ci ? <p className="flex items-center gap-1 text-xs text-slate-300">CI {ci}<CopyIdentity value={ci} /></p> : null}
        </div>
        <SignOut card />
      </div>
      <p className="text-xs text-slate-400">Saldo para jugar</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{amount.format(totalCents / 100)} <span className="text-base font-normal text-slate-300">fichas</span></p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="relative rounded-xl border border-white/10 p-3">
          <dt className="flex items-center gap-1.5 text-xs text-slate-400"><svg className="text-[#00c853]" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v4c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" /></svg>Para retirar</dt>
          <dd className="mt-1 font-semibold tabular-nums">{chips(withdrawableCents)}</dd>
          <Link href="/retiros" className="absolute inset-0 rounded-xl" aria-label="Pedir un retiro" />
        </div>
        <div className="rounded-xl border border-white/10 p-3">
          <dt className="flex items-center gap-1.5 text-xs text-slate-400"><svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><rect x="2.5" y="8" width="19" height="9" rx="4" /><path d="M8 12.5h3M9.5 11v3M15.5 12h.01M17.5 14h.01" /></svg>Solo para jugar</dt>
          <dd className="mt-1 font-semibold tabular-nums">{chips(totalCents - withdrawableCents)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex gap-2 text-xs leading-5 text-slate-400"><svg className="mt-0.5 shrink-0 text-slate-500" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 8h.01" /></svg><span>Las cargas y los bonos se usan primero para jugar. Los premios quedan disponibles para retirar.</span></p>
    </div>}
    {depositNote ? <p className="rounded-xl border border-amber-200/30 bg-black/30 p-3 text-sm leading-6">{depositNote}</p> : null}
    <div className="grid gap-2">
      <Link href={primary.href} className={`relative flex min-h-11 items-center justify-center gap-2 overflow-hidden px-4 text-sm font-bold ${primary.href === "/cargar" ? "rounded-[6px]" : "rounded-xl"}`} style={primary.href === "/cargar" ? { background: "linear-gradient(180deg, #3dff86 0%, #00c853 46%, #067a34 100%)", color: "#000" } : { background: accent, color: ink }}>{primary.href === "/cargar" ? <span className="load-chip-shine" aria-hidden="true" /> : null}<span className="relative z-10 inline-flex items-center gap-2">{primary.href === "/cargar" ? <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M12 13v3.5M10.2 14.7h3.6" /></svg> : null}{primary.label}</span></Link>
      {links.map((link) => <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-black px-3 py-3 text-sm">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-300"><RowGlyph href={link.href} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{link.label}</span>
          <span className="mt-0.5 block text-xs text-slate-400">{link.hint}</span>
        </span>
        {link.href === "/verificacion" && tone === "ok" ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#00c853] px-2 py-1 text-[10px] font-semibold text-black"><svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.2 4.7 8.7 9.8 3.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Verificada</span> : null}
        <svg className="shrink-0 text-slate-500" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="m9 6 6 6-6 6" /></svg>
      </Link>)}
    </div>
    {totalCents === null || withdrawableCents === null ? <SignOut /> : null}
  </section>;
}

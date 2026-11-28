import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { providers } from "@/lib/game-library";
import { adminSession, publicHouseCatalog } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { surfaceOrigin } from "@/lib/tenant";



const card = "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#142440]";
const number = (value: number) => new Intl.NumberFormat("es-PY").format(value);

async function Overview({ slug }: { slug: string }) {
  const account = await adminSession(slug);
  if (!account) return null;
  const house = account.casino;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const [games, [totals]] = await Promise.all([
    publicHouseCatalog(slug),
    supabaseRequest<{ players: number; balance_cents: number }[]>("/rest/v1/rpc/house_operation_totals", account.session.auth, { target_casino: house.id }),
  ]);
  const active = house.status === "active";
  const balance = totals?.balance_cents ?? 0;
  const playerCount = totals?.players ?? 0;
  return <div className="flex flex-col gap-5" data-screen="admin-resumen">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2"><span className="text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Mi casino / Resumen</span><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}><span className="size-1 rounded-full bg-current" />{active ? "Activo" : "Suspendido"}</span></div><h1 className="text-2xl font-semibold tracking-tight">Tu casa, de un vistazo</h1><p className="mt-2 text-xs leading-5 text-slate-400">Administrá {house.name} y prepará la experiencia de tus jugadores.</p></div>
      <a href={surfaceOrigin("casa", slug, root)} className="rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10">Abrir mi casa ↗</a>
    </header>
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        { label: "Jugadores", value: number(playerCount), detail: "Registrados en esta casa", href: "/jugadores" },
        { label: "Saldo de jugadores", value: new Intl.NumberFormat("es-PY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance / 100), detail: "Saldo según el historial de fichas", href: "/jugadores" },
        { label: "Juegos habilitados", value: number(games.length), detail: "Selección de tu casino", href: "/juegos" },
        { label: "Dominio de la casa", value: slug, detail: "Ver direcciones de acceso", href: "/dominio" },
      ].map((item) => <div key={item.label} className={`${card} px-4 py-3`}><dt className="text-[11px] font-medium text-slate-400">{item.label}</dt><dd className="mt-2 truncate text-xl font-semibold tracking-tight text-slate-100 tabular-nums">{item.value}</dd><p className="mt-2 text-[10px] text-slate-400">{item.detail}</p><Link href={item.href} className="mt-2 inline-block text-[10px] text-slate-300 hover:text-sky-300">Ver detalle →</Link></div>)}
    </dl>
    <div className="grid items-start gap-5 xl:grid-cols-[1.45fr_1fr]">
      <section className={card}><div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4"><div><h2 className="text-sm font-semibold">Administrá tu casino</h2><p className="mt-1 text-xs text-slate-400">Lo principal, en un solo lugar.</p></div><span className="text-[10px] text-slate-600">06 secciones</span></div><div className="px-5">{[
        { href: "/apariencia", icon: "◇", title: "Apariencia de la casa", text: "Identidad, colores, portada y banners", detail: "Personalizar" },
        { href: "/jugadores", icon: "◎", title: "Jugadores y saldos", text: `${playerCount} jugadores registrados en tu casa`, detail: "Consultar" },
        { href: "/registros", icon: "✓", title: "Registros", text: "Solicitudes de verificación", detail: "Revisar" },
        { href: "/cargas", icon: "+", title: "Cargas de fichas", text: "Comprobantes, aprobación e historial", detail: "Gestionar" },
        { href: "/juegos", icon: "▦", title: "Juegos habilitados", text: `${games.length} juegos en tu selección`, detail: "Ver juegos" },
        { href: "/dominio", icon: "↗", title: "Dominio y accesos", text: "Direcciones de la casa y del panel", detail: "Revisar" },
      ].map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-4 border-b border-white/[0.06] py-5 last:border-0"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-xl text-slate-400 group-hover:border-sky-300/20 group-hover:text-sky-300">{item.icon}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-medium text-slate-200 group-hover:text-white">{item.title}</h3><p className="mt-1 text-[11px] leading-5 text-slate-400">{item.text}</p></div><span className="hidden text-[11px] text-slate-400 sm:block">{item.detail}</span><span className="text-slate-600 group-hover:text-sky-300">›</span></Link>)}</div></section>
      <div className="flex flex-col gap-5">
        <section className={`${card} p-5`}><p className="text-[10px] tracking-wider text-slate-400 uppercase">Tu casa pública</p><h2 className="mt-3 text-lg font-semibold">{house.name}</h2><p className="mt-2 text-xs leading-6 text-slate-400">Revisá cómo se presenta tu casino a los jugadores.</p><a href={surfaceOrigin("casa", slug, root)} className="mt-4 inline-block text-xs text-sky-200 hover:text-sky-100">Visitar casa ↗</a></section>
        <section className={card}><div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4"><h2 className="text-sm font-semibold">Tu selección de juegos</h2><span className="text-xs text-slate-400">{games.length}</span></div><ul className="px-5">{games.map((game, index) => <li key={game.slug} className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0"><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-lg text-slate-400">{index ? "✦" : "◎"}</span><div className="flex-1"><p className="text-xs font-medium">{game.name}</p><p className="mt-1 text-[10px] text-slate-400">{providers.find((provider) => provider.slug === game.providerSlug)?.name}</p></div><span className="text-[10px] text-slate-400">v{game.version}</span></li>)}</ul>{!games.length && <p className="px-5 py-5 text-xs text-slate-400">Todavía no hay juegos habilitados.</p>}</section>
      </div>
    </div>
  </div>;
}
export default function AdminOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Overview slug={slug} />}</HouseGate>;
}

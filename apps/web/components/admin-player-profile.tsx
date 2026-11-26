"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/nav-icon";
import {
  loadAdminPlayer, openPlayerDocument, reviewAdminPlayer, saveAdminPlayer,
} from "@/lib/house-operations-actions";
import type { DirectoryPlayer, PlayerMovement } from "@/lib/house-operations";
import { verificationLabels, type IdentityPhotos } from "@/lib/verification";

const format = (cents: number) => new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 }).format(cents / 100);
const dates = new Intl.DateTimeFormat("es-PY", { dateStyle: "short", timeStyle: "short", timeZone: "America/Asuncion" });
const date = (value?: string | null) => value ? dates.format(new Date(value)) : "Sin datos";
const field = "w-full min-w-0 rounded-md border border-white/10 bg-[#17223a] px-3 py-2 text-sm text-white focus:border-sky-400";
const button = "rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-50";
const card = "space-y-4 rounded-lg border border-white/5 bg-[#202c44] p-4";
const fields = [
  ["firstName", "Nombre", "text"], ["lastName", "Apellido", "text"],
  ["email", "Correo electrónico", "email"], ["phone", "Teléfono", "tel"], ["birthDate", "Fecha de nacimiento", "date"],
] as const;
const photos = [["front", "CI · Frente"], ["back", "CI · Reverso"], ["selfie", "Selfie"]] as const;

function Heading({ icon, children }: { icon: string; children: ReactNode }) {
  return <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><NavIcon href={icon} />{children}</h3>;
}

export function AdminPlayerProfile({ player, houseName }: { player: DirectoryPlayer; houseName: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [activity, setActivity] = useState<{ movements: PlayerMovement[]; available: (keyof IdentityPhotos)[] } | null>(null);
  const [asset, setAsset] = useState<{ url: string; title: string } | null>(null);
  const [tab, setTab] = useState<"movements" | "verification">("movements");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAdminPlayer(player.id).then((data) => { if (active) setActivity(data); }, () => {
      if (active) setMessage("No se pudieron cargar los documentos y los movimientos.");
    });
    return () => { active = false; };
  }, [player.id, player.submittedAt]);

  async function perform(task: () => Promise<string>) {
    setPending(true);
    setMessage("");
    try {
      setMessage(await task());
      router.refresh();
    } catch {
      setMessage("No se pudo completar la operación. Volvé a intentar.");
    } finally {
      setPending(false);
    }
  }

  const name = [player.details.firstName, player.details.lastName].filter(Boolean).join(" ") || "Jugador";
  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111b2f]">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
      <div className="flex items-center gap-3"><NavIcon href="/perfil" /><div><h2 className="font-semibold">{name}</h2><p className="text-xs text-slate-400">CI {player.ci || "sin registrar"} · {houseName}</p></div></div>
      <span className={`rounded-full border px-3 py-1 text-xs ${player.status === "verified" ? "border-emerald-400/25 text-emerald-300" : "border-amber-400/25 text-amber-200"}`}>{verificationLabels[player.status]}</span>
    </header>
    <div className="grid gap-3 p-3 lg:grid-cols-2">
      <div className={card}>
        <section>
          <Heading icon="/perfil">Datos del usuario</Heading>
          <form id={`profile-${player.id}`} className="grid gap-2" onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void perform(() => saveAdminPlayer(data));
          }}>
            <input type="hidden" name="playerId" value={player.id} />
            <p className="break-all text-xs text-slate-400">ID de usuario {player.id}</p>
            <p className="text-xs text-slate-300">Casa {houseName} · Rol Jugador</p>
            {fields.map(([key, label, type]) => <label key={key} className="grid items-center gap-1 text-xs text-slate-300 sm:grid-cols-[110px_1fr]">
              {label}<input name={key} type={type} defaultValue={player.details[key]} required maxLength={254} className={field} />
            </label>)}
          </form>
        </section>
        <section className="border-t border-white/10 pt-4">
          <Heading icon="/fichas">Saldo y fichas</Heading>
          <p className="text-2xl font-bold tabular-nums">{format(player.balanceCents)} <span className="text-sm text-slate-400">fichas</span></p>
        </section>
      </div>
      <div className={card}>
        <section>
          <Heading icon="/registros">Documento y verificación</Heading>
          <div className="grid grid-cols-3 gap-2">
            {photos.map(([key, title]) => <button key={key} type="button" className={button} disabled={!activity?.available.includes(key)} onClick={async () => {
              try {
                const url = await openPlayerDocument(player.id, key);
                if (!url) { setMessage("Documento no disponible."); return; }
                setAsset({ url, title });
                dialog.current?.showModal();
              } catch { setMessage("No se pudo abrir el documento."); }
            }}>{title}<span className="mt-1 block text-[10px] text-slate-400">{activity?.available.includes(key) ? "Ampliar" : "Sin foto"}</span></button>)}
          </div>
          {player.status === "pending" && activity && activity.available.length !== 3 &&
            <p className="mt-3 text-xs text-slate-400">La aprobación se habilita cuando se reciben las tres fotos.</p>}
          <form className="mt-3 space-y-3" onSubmit={(event) => {
            event.preventDefault();
            const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
            const decision = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
            if (decision === "verified" || decision === "denied" || decision === "rejected")
              void perform(() => reviewAdminPlayer(player.id, decision, reason));
          }}>
            <label className="grid gap-1 text-xs text-slate-300">Motivo de la decisión<textarea name="reason" className={field} maxLength={1000} rows={2} defaultValue={player.reason} placeholder="Obligatorio para denegar o rechazar" /></label>
            <div className="flex flex-wrap gap-2">
              <button value="verified" disabled={pending || player.status !== "pending" || activity?.available.length !== 3} className={`${button} text-emerald-300`}>Aprobar</button>
              <button value="denied" disabled={pending} className={`${button} text-amber-300`}>Denegar</button>
              <button value="rejected" disabled={pending} className={`${button} text-red-300`}>Rechazar</button>
            </div>
          </form>
        </section>
        <section className="border-t border-white/10 pt-4">
          <Heading icon="/historial">Información de la cuenta</Heading>
          <dl className="space-y-2 text-xs">
            {([["Registro", player.createdAt], ["Solicitud enviada", player.submittedAt], ["Último ingreso", player.lastSignInAt]] as const)
              .map(([label, value]) => <div key={label} className="flex justify-between gap-2"><dt className="text-slate-400">{label}</dt><dd>{date(value)}</dd></div>)}
          </dl>
        </section>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 border-y border-white/10 bg-[#18233a] p-3">
      <button disabled={pending} className={`${button} bg-sky-500`} type="submit" form={`profile-${player.id}`}>Guardar datos</button>
      <Link href="/cargas" className={button}>Gestionar cargas</Link>
      <Link href="/retiros" className={button}>Gestionar retiros</Link>
    </div>
    <div className="space-y-3 p-4">
      {message && <p role="status" className="text-xs text-sky-200">{message}</p>}
      <div className="flex gap-2">{(["movements", "verification"] as const).map((item) => <button key={item} type="button" aria-pressed={tab === item} onClick={() => setTab(item)} className={`${button} ${tab === item ? "bg-sky-400/20" : ""}`}>{item === "movements" ? "Movimientos" : "Verificación"}</button>)}</div>
      {tab === "verification" ? <p className="text-sm">{verificationLabels[player.status]}{player.reason && ` · ${player.reason}`}</p>
        : activity?.movements.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead><tr><th>Fecha</th><th>Movimiento</th><th className="text-right">Fichas</th></tr></thead>
          <tbody>{activity.movements.map((movement) => <tr key={movement.id} className="border-t border-white/10"><td className="py-2">{date(movement.created_at)}</td><td>{{ adjustment: "Acreditación", stake: "Apuesta", win: "Premio" }[movement.kind]}</td><td className="text-right tabular-nums">{format(movement.amount_cents)}</td></tr>)}</tbody>
        </table></div> : <p className="text-xs text-slate-400">{activity ? "Todavía no hay movimientos." : "Cargando movimientos…"}</p>}
    </div>
    <dialog ref={dialog} aria-label="Documento ampliado" onClose={() => setAsset(null)} className="fixed inset-0 m-auto w-[min(850px,95vw)] rounded-xl border border-white/15 bg-[#101c35] p-4 text-white backdrop:bg-black/80">
      <button type="button" onClick={() => dialog.current?.close()} className={button}>Cerrar</button>
      {asset && <img src={asset.url} alt={asset.title} className="mt-3 max-h-[75dvh] w-full object-contain" />}
    </dialog>
  </section>;
}

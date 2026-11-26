"use client";

import { useActionState } from "react";
import { assignHouseAdmin } from "@/lib/platform-actions";

export function AssignHouseAdminForm({ houses }: { houses: { id: string; name: string }[] }) {
  const [result, action, pending] = useActionState(
    async (_previous: { ok: boolean; message: string }, data: FormData) => assignHouseAdmin(data),
    { ok: false, message: "" },
  );
  const field = "w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2";

  return <section className="space-y-3 rounded-2xl border border-white/10 p-4">
    <h2 className="font-semibold">Asignar administrador</h2>
    <form action={action} className="grid max-w-md gap-3">
      <label className="grid gap-1">Casa
        <select name="casino" className={field} defaultValue="" required>
          <option value="" disabled>Elegí una casa</option>
          {houses.map((house) => <option key={house.id} value={house.id}>{house.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1">Correo del administrador
        <input name="email" type="email" autoComplete="off" maxLength={254} required className={field} />
      </label>
      <label className="grid gap-1">Contraseña inicial
        <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} className={field} />
        <span className="text-sm text-slate-300">Completala solo para crear una cuenta nueva.</span>
      </label>
      <button className="justify-self-start rounded-lg bg-sky-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50" disabled={pending}>
        {pending ? "Asignando…" : "Asignar administrador"}
      </button>
    </form>
    {result.message && <p role="status" className={result.ok ? "text-emerald-300" : "text-amber-200"}>{result.message}</p>}
  </section>;
}

"use client";

import { useState } from "react";
import { HouseSubmissionForm } from "@/components/house-submission-form";

const field = "w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2";

export function WithdrawalRequest({ action, available }: {
  action: (data: FormData) => Promise<{ ok: boolean; message: string }>;
  available: string;
}) {
  const [method, setMethod] = useState<"alias" | "bank">("alias");
  const option = (value: "alias" | "bank") => method === value
    ? "rounded-[6px] bg-white px-3 py-2 text-sm font-semibold text-black"
    : "rounded-[6px] border border-white/15 px-3 py-2 text-sm text-white";

  return <HouseSubmissionForm action={action} label="Solicitar retiro" rememberRequest formClassName="space-y-4 rounded-[6px] border border-white/10 bg-black p-4" buttonClassName="w-full rounded-[6px] bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50">
    <input type="hidden" name="method" value={method} />
    <div className="grid grid-cols-2 gap-2">
      <button type="button" className={option("alias")} aria-pressed={method === "alias"} onClick={() => setMethod("alias")}>Alias</button>
      <button type="button" className={option("bank")} aria-pressed={method === "bank"} onClick={() => setMethod("bank")}>Cuenta bancaria</button>
    </div>
    {method === "alias" ? <label className="grid gap-1 text-sm">CI, RUC, teléfono o correo<input name="alias" className={field} required placeholder="Un solo dato" /></label> : <>
      <label className="grid gap-1 text-sm">Nombre del titular<input name="holder" className={field} required /></label>
      <label className="grid gap-1 text-sm">Entidad bancaria<input name="bank" className={field} required /></label>
      <label className="grid gap-1 text-sm">Número de cuenta<input name="account" className={field} required inputMode="numeric" /></label>
      <label className="grid gap-1 text-sm">Número de CI<input name="identity" className={field} required inputMode="numeric" /></label>
    </>}
    <label className="grid gap-1 text-sm">Monto a retirar<input name="amount" inputMode="decimal" className={field} required /></label>
    <p className="text-xs text-slate-400">Podés pedir hasta {available} fichas. Al solicitar, ese monto sale de tu saldo. Si el cajero rechaza el pago, las fichas vuelven.</p>
  </HouseSubmissionForm>;
}

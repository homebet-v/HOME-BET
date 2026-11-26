"use client";

import { useState } from "react";
import { CopyIdentity } from "@/components/copy-identity";
import { HouseSubmissionForm } from "@/components/house-submission-form";
import { parseDepositAmount } from "@/lib/deposits";
import type { HouseDepositAccount } from "@/lib/deposit-account";

const field = "w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2";
const forward = "w-full rounded-[6px] px-4 py-3 text-sm font-bold text-black";
const green = { background: "linear-gradient(180deg, #3dff86 0%, #00c853 46%, #067a34 100%)" };
const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

export function DepositWizard({ action, account, bonuses }: {
  action: (data: FormData) => Promise<{ ok: boolean; message: string }>;
  account: HouseDepositAccount | null;
  bonuses: readonly { id: string; name: string }[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("");
  const [bonus, setBonus] = useState("");
  const [error, setError] = useState("");
  const cents = readableAmount(amount);

  function continueFromAmount() {
    if (cents === null) {
      setError("Ingresá el monto de la carga.");
      return;
    }
    setError("");
    setStep(2);
  }

  return <HouseSubmissionForm action={action} label="Enviar comprobante" rememberRequest formClassName="space-y-4" buttonClassName={step === 3 ? forward : "hidden"} buttonStyle={step === 3 ? green : undefined}>
    <ol className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
      {["Monto", "Cuenta", "Comprobante"].map((label, index) => <li key={label} className={step === index + 1 ? "font-semibold text-white" : ""}>{index + 1}. {label}</li>)}
    </ol>
    <input type="hidden" name="amount" value={amount} />
    <input type="hidden" name="bonus" value={bonus} />
    {step === 1 && <div className="space-y-4 rounded-[6px] border border-white/10 bg-black p-4">
      <div>
        <h2 className="font-semibold">¿Cuánto querés cargar?</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">Escribí el monto. En el paso siguiente vas a ver a qué cuenta transferir.</p>
      </div>
      <label className="grid gap-1 text-sm">Monto en fichas
        <input name="amount-entry" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); continueFromAmount(); } }} className={field} />
      </label>
      {bonuses.length > 0 && <label className="grid gap-1 text-sm">Bono
        <select value={bonus} onChange={(event) => setBonus(event.target.value)} className={field}>
          <option value="">Sin bono</option>
          {bonuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>}
      {error ? <p className="text-sm text-slate-200">{error}</p> : null}
      <button type="button" onClick={continueFromAmount} className={forward} style={green}>Continuar</button>
    </div>}
    {step === 2 && <div className="space-y-3">
      <div className="rounded-[6px] border border-white/10 bg-black p-4">
        <h2 className="font-semibold">Transferí {cents === null ? "el monto" : `${chips.format(cents / 100)} fichas`}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">Copiá el titular, el CI o el alias y pegalo en tu banco. El banco se muestra para que sepas dónde va.</p>
      </div>
      {account ? <>
        <AccountLine label="Titular" value={account.holderName} copy />
        <AccountLine label="CI" value={account.identityNumber} copy />
        <AccountLine label="Alias" value={account.alias} copy />
        <AccountLine label="Banco" value={account.bankName} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setStep(1)} className="rounded-[6px] border border-white/15 px-4 py-3 text-sm">Volver</button>
          <button type="button" onClick={() => setStep(3)} className={forward} style={green}>Ya transferí</button>
        </div>
      </> : <div className="space-y-3 rounded-[6px] border border-white/10 bg-black p-4">
        <p className="text-sm leading-6">La casa todavía no publicó la cuenta para transferir.</p>
        <button type="button" onClick={() => setStep(1)} className="rounded-[6px] border border-white/15 px-4 py-3 text-sm">Volver</button>
      </div>}
    </div>}
    {step === 3 && <div className="space-y-4 rounded-[6px] border border-white/10 bg-black p-4">
      <div>
        <h2 className="font-semibold">Subí el comprobante</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">Cuando lo enviás, la casa lo ve en Cargas y acredita las fichas.</p>
      </div>
      <label className="grid gap-1 text-sm">Comprobante de pago
        <input name="receipt" type="file" accept="image/jpeg,image/png,image/webp" required className={field} />
      </label>
      <p className="text-xs text-slate-400">JPG, PNG o WebP de hasta 3 MB.</p>
      <button type="button" onClick={() => setStep(2)} className="text-sm text-slate-300">Volver a la cuenta</button>
    </div>}
  </HouseSubmissionForm>;
}

function readableAmount(value: string) {
  try {
    return parseDepositAmount(value);
  } catch {
    return null;
  }
}

function AccountLine({ label, value, copy = false }: { label: string; value: string; copy?: boolean }) {
  return <div className="rounded-[6px] border border-white/10 bg-black px-4 py-3">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="mt-1 flex items-center justify-between gap-3 font-semibold"><span className="break-all">{value}</span>{copy ? <CopyIdentity value={value} label={label} /> : null}</p>
  </div>;
}

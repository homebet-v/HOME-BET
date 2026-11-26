import type { CSSProperties } from "react";
import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { PlayerIdentityForm } from "@/components/player-identity-form";
import { SignOut } from "@/components/platform-login";
import { defaultAppearance, palettes } from "@/lib/appearance";
import { playerIdentitySession } from "@/lib/house-operations";
import { emptyDetails } from "@/lib/verification";

export const metadata = { title: "Mi perfil · Verificación" };

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await playerIdentitySession(slug);
    if (!account) return <Link className="inline-block p-4 underline" href="/cuenta">Ingresá con tu CI para verificar tu cuenta</Link>;
    const { casino, details, session } = account;
    const theme = defaultAppearance(casino.name);
    const palette = palettes[theme.palette];
    const verified = Boolean(session.profile.verified_at);
    const rejected = details.verification_decision === "rejected";
    const waiting = Boolean(details.verification_submitted_at && details.verification_decision === "pending");
    const needsCorrection = details.verification_decision === "denied";
    const status = verified ? "Cuenta verificada" : rejected ? "Solicitud rechazada" : waiting ? "En revisión"
      : needsCorrection ? "Datos por corregir" : "Datos por completar";
    const photoDirectory = `${casino.id}/${session.profile.id}/identity/`;
    const savedPhotos = (["front", "back", "selfie"] as const)
      .filter((key) => details.identity_files[key]?.startsWith(photoDirectory));
    const initial = {
      ...emptyDetails,
      firstName: session.profile.display_name ?? "",
      ...details.identity_details,
    };

    return <section className="mx-auto max-w-3xl space-y-5 p-3 text-white sm:p-5" style={{
      "--identity-accent": palette.accent,
      "--identity-ink": palette.ink,
      "--identity-line": `color-mix(in srgb, ${palette.accent} 35%, transparent)`,
    } as CSSProperties}>
      <header className="relative isolate overflow-hidden rounded-3xl border border-[color:var(--identity-line)] bg-[color:var(--identity-ink)] px-5 py-6 sm:px-8 sm:py-8">
        {theme.backgroundImage && <img src={theme.backgroundImage} alt="" className="pointer-events-none absolute inset-0 -z-20 size-full object-cover" />}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-[color:var(--identity-ink)] to-black/40" />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {theme.logoImage ? <img src={theme.logoImage} alt={casino.name} className="h-10 w-36 object-contain object-left" />
            : <span className="font-semibold text-[color:var(--identity-accent)]">{casino.name}</span>}
          <span className="rounded-full border border-[color:var(--identity-line)] bg-black/50 px-3 py-1 text-xs font-semibold text-[color:var(--identity-accent)]">{status}</span>
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Verificación de identidad</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
          {verified ? "Tu identidad está confirmada." : rejected ? "Contactá al administrador de tu casa si necesitás ayuda."
            : waiting ? "El administrador de tu casa está revisando tus datos y fotos."
            : "Completá los datos que faltan y adjuntá las fotos para activar tu cuenta."}
        </p>
      </header>

      {details.verification_reason && <p className="rounded-xl border border-amber-200/25 bg-black/50 p-4 text-sm text-amber-100">{details.verification_reason}</p>}
      {verified || waiting || rejected
        ? <section className="space-y-3 rounded-2xl border border-[color:var(--identity-line)] bg-black/30 p-4 sm:p-6">
          <h2 className="font-semibold">Datos de mi cuenta</h2>
          <dl className="divide-y divide-white/10 text-sm">
            {([
              ["Número de CI", details.identity_number], ["Nombre", [initial.firstName, initial.lastName].filter(Boolean).join(" ")],
              ["Correo electrónico", initial.email], ["Teléfono", initial.phone], ["Fecha de nacimiento", initial.birthDate],
            ] as const).filter(([, value]) => value).map(([label, value]) =>
              <div key={label} className="grid gap-1 py-2 sm:grid-cols-2">
                <dt className="text-white/70">{label}</dt><dd className="break-words">{value}</dd>
              </div>)}
          </dl>
          {verified && <Link href="/" className="inline-block text-sm font-semibold text-[color:var(--identity-accent)] underline">Volver a la casa</Link>}
        </section>
        : <PlayerIdentityForm initial={initial} ci={details.identity_number} savedPhotos={savedPhotos} />}
      <SignOut />
    </section>;
  }}</HouseGate>;
}

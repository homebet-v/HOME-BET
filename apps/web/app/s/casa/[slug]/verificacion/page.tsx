import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { HouseSubmissionForm } from "@/components/house-submission-form";
import { SignOut } from "@/components/platform-login";
import { playerIdentitySession } from "@/lib/house-operations";
import { submitIdentity } from "@/lib/house-operations-actions";

const field = "w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm";
const identity = [
  ["firstName", "Nombre", "text"], ["lastName", "Apellido", "text"], ["email", "Correo electrónico", "email"],
  ["phone", "Teléfono", "tel"], ["birthDate", "Fecha de nacimiento", "date"],
] as const;
const photos = [["front", "Frente de la cédula"], ["back", "Reverso de la cédula"], ["selfie", "Selfie"]] as const;

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await playerIdentitySession(slug);
    if (!account) return <Link className="inline-block p-4 underline" href="/cuenta">Ingresá con tu CI para verificar tu cuenta</Link>;
    const { details, session } = account;
    const verified = Boolean(session.profile.verified_at);
    const rejected = details.verification_decision === "rejected";
    const waiting = details.verification_submitted_at && details.verification_decision === "pending";

    return <section className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Verificación de identidad</h1>
      {verified ? <><p>Tu cuenta está verificada.</p><Link className="underline" href="/">Volver a la casa</Link></>
        : <>
          {details.verification_reason && <p className="text-sm text-amber-200">{details.verification_reason}</p>}
          {rejected ? <p>La solicitud fue rechazada. Contactá al administrador de la casa.</p>
            : waiting ? <p>Tu solicitud está en revisión.</p>
            : <HouseSubmissionForm action={submitIdentity} label="Enviar a revisión">
              {identity.map(([key, label, type]) => <label key={key} className="grid gap-1 text-sm">
                {label}<input name={key} type={type} defaultValue={details.identity_details[key] ?? (key === "firstName" ? session.profile.display_name ?? "" : "")} className={field} required maxLength={254} />
              </label>)}
              <p className="text-sm">Adjuntá las tres fotos en JPG, PNG o WebP. Hasta 1 MB por imagen.</p>
              {photos.map(([key, label]) => <label key={key} className="grid gap-1 text-sm">
                {label}<input name={key} type="file" accept="image/jpeg,image/png,image/webp" className={field} required />
              </label>)}
            </HouseSubmissionForm>}
        </>}
      <SignOut />
    </section>;
  }}</HouseGate>;
}

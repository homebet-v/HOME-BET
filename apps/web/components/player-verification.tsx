"use client";

import { useState, type ChangeEvent } from "react";
import { useDemoPlayer } from "@/components/demo-player-context";
import { sendDemoVerification } from "@/lib/registration-demo";
import { canSubmitVerification, validateDetails, verificationLabels, type IdentityDetails, type IdentityPhotos } from "@/lib/verification";

const photoLabels = { front: "CI · Frente", back: "CI · Reverso", selfie: "Selfie" };
const input = "w-full min-w-0 rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm text-white [color-scheme:dark]";
export function PlayerVerification({ accent, ink }: { accent: string; ink: string }) {
  const demo = useDemoPlayer();
  const player = demo?.player;
  const [step, setStep] = useState<"details" | "photos">("details");
  const [details, setDetails] = useState<IdentityDetails>(player!.details);
  const [photos, setPhotos] = useState<IdentityPhotos>(player!.photos);
  const [error, setError] = useState("");
  if (!player) return null;
  if (!canSubmitVerification(player.status)) return <section className="space-y-3 rounded-xl border border-white/15 bg-black/20 p-4"><h3 className="font-semibold">{verificationLabels[player.status]}</h3><p className="text-sm leading-6 text-slate-300">{player.status === "pending" ? "Tu casa está revisando tus datos y las tres fotografías. Podés explorar el catálogo; para jugar necesitás la aprobación." : player.status === "rejected" ? "Tu cuenta fue rechazada. No podés modificar ni reenviar la solicitud. Solo la administración puede cambiar este estado." : "Tu identidad fue aprobada."}</p>{player.reason && <p className="text-sm text-amber-200">Motivo: {player.reason}</p>}</section>;
  const update = (key: keyof IdentityDetails, value: string) => setDetails((current) => ({ ...current, [key]: value }));
  const selectPhoto = (key: keyof IdentityPhotos, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) { setError("Usá una foto JPG, PNG o WebP de hasta 8 MB."); return; }
    const url = URL.createObjectURL(file);
    setPhotos((current) => ({ ...current, [key]: url }));
    setError("");
  };
  return <section className="space-y-4">
    <div><h3 className="text-base font-semibold">Verificá tu identidad</h3><p className="mt-2 text-xs leading-5 text-slate-400">CI {player.ci} · Tus datos deben coincidir con tu documento. Solo mayores de 18 años.</p></div>
    {player.status === "denied" && <p className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">Corregí tu solicitud: {player.reason}</p>}
    <ol className="grid grid-cols-2 gap-2 text-xs"><li className="rounded-lg border p-2" style={{ borderColor: step === "details" ? accent : "#ffffff20" }}>1. Datos personales</li><li className="rounded-lg border p-2" style={{ borderColor: step === "photos" ? accent : "#ffffff20" }}>2. Documento y selfie</li></ol>
    {step === "details" ? <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); const message = validateDetails(details); setError(message); if (!message) setStep("photos"); }}>
      <label className="grid gap-2 text-xs text-slate-300">Nombre<input required autoComplete="given-name" maxLength={100} value={details.firstName} onChange={(event) => update("firstName", event.target.value)} className={input} /></label>
      <label className="grid gap-2 text-xs text-slate-300">Apellido<input required autoComplete="family-name" maxLength={100} value={details.lastName} onChange={(event) => update("lastName", event.target.value)} className={input} /></label>
      <label className="grid gap-2 text-xs text-slate-300">Teléfono<input required type="tel" autoComplete="tel" placeholder="+595 981 123456" maxLength={25} value={details.phone} onChange={(event) => update("phone", event.target.value)} className={input} /></label>
      <label className="grid gap-2 text-xs text-slate-300">Correo electrónico<input required type="email" autoComplete="email" maxLength={254} value={details.email} onChange={(event) => update("email", event.target.value)} className={input} /></label>
      <label className="grid gap-2 text-xs text-slate-300">Fecha de nacimiento<input required type="date" autoComplete="bday" min="1900-01-01" value={details.birthDate} onChange={(event) => update("birthDate", event.target.value)} className={input} /></label>
      <button className="w-full rounded-xl py-3 text-sm font-semibold" style={{ background: accent, color: ink }}>Continuar con las fotos →</button>
    </form> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); try { sendDemoVerification(player.id, details, photos); setError(""); } catch (error) { setError((error as Error).message); } }}>
      <p className="text-xs leading-5 text-slate-400">Documento completo, sin reflejos y con texto legible. En la selfie, mostrá tu rostro de frente, sin lentes oscuros ni filtros.</p>
      {(Object.entries(photoLabels) as [keyof IdentityPhotos, string][]).map(([key, label]) => <fieldset key={key} className="space-y-3 rounded-xl border border-white/15 p-3"><legend className="px-1 text-sm font-medium">{label}</legend>{photos[key] && <img src={photos[key]} alt={`Vista previa: ${label}`} className="max-h-40 w-full rounded-lg bg-black/30 object-contain" />}<div className="grid grid-cols-2 gap-2 text-center text-xs"><label className="relative cursor-pointer rounded-lg border border-white/20 p-3 focus-within:ring-2 focus-within:ring-white">{photos[key] ? "Cambiar foto" : "Cargar foto"}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Cargar ${label}`} onChange={(event) => selectPhoto(key, event)} className="absolute inset-0 w-full cursor-pointer opacity-0" /></label><label className="relative cursor-pointer rounded-lg border border-white/20 p-3 focus-within:ring-2 focus-within:ring-white">Tomar foto<input type="file" accept="image/jpeg,image/png,image/webp" capture={key === "selfie" ? "user" : "environment"} aria-label={`Tomar ${label}`} onChange={(event) => selectPhoto(key, event)} className="absolute inset-0 w-full cursor-pointer opacity-0" /></label></div></fieldset>)}
      <p className="text-xs text-slate-400">{Object.values(photos).filter(Boolean).length} de 3 fotos · JPG, PNG o WebP · hasta 8 MB cada una</p>
      <button disabled={!photos.front || !photos.back || !photos.selfie} className="w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-40" style={{ background: accent, color: ink }}>Verificar · enviar a revisión</button><button type="button" onClick={() => { setStep("details"); setError(""); }} className="w-full py-2 text-xs text-slate-300">← Corregir mis datos</button>
    </form>}
    <p role="alert" className="text-xs leading-5 text-amber-200">{error}</p>
    <p className="text-[11px] leading-5 text-slate-500">Prueba temporal: usá datos y fotos ficticios. No se envían documentos a un servidor ni se guardan al recargar.</p>
  </section>;
}

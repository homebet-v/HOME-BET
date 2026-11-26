"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { compressIdentityImage } from "@/lib/identity-image";
import { submitIdentity } from "@/lib/house-operations-actions";
import { validateDetails, type IdentityDetails } from "@/lib/verification";

const fields = [
  { key: "firstName", label: "Nombre", type: "text", autoComplete: "given-name" },
  { key: "lastName", label: "Apellido", type: "text", autoComplete: "family-name" },
  { key: "email", label: "Correo electrónico", type: "email", autoComplete: "email" },
  { key: "phone", label: "Teléfono", type: "tel", autoComplete: "tel" },
  { key: "birthDate", label: "Fecha de nacimiento", type: "date", autoComplete: "bday" },
] as const;

const photos = [
  { key: "front", label: "Frente de la cédula", hint: "Incluí los bordes y dejá el número legible." },
  { key: "back", label: "Reverso de la cédula", hint: "Asegurate de que se lea todo el reverso." },
  { key: "selfie", label: "Selfie", hint: "Mirá de frente, con buena luz y sin filtros." },
] as const;

type PhotoKey = (typeof photos)[number]["key"];
type Photo = { file: File; url: string };
const inputClass = "min-w-0 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--identity-accent)]";
const labelClass = "text-sm font-medium text-white/90";
const panelClass = "overflow-hidden rounded-2xl border border-[color:var(--identity-line)] bg-black/25";

export function PlayerIdentityForm({ initial, ci, savedPhotos }: { initial: IdentityDetails; ci: string | null; savedPhotos: PhotoKey[] }) {
  const router = useRouter();
  const [details, setDetails] = useState(initial);
  const [images, setImages] = useState<Partial<Record<PhotoKey, Photo>>>({});
  const [processing, setProcessing] = useState<Partial<Record<PhotoKey, boolean>>>({});
  const [photoErrors, setPhotoErrors] = useState<Partial<Record<PhotoKey, string>>>({});
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const currentImages = useRef<Partial<Record<PhotoKey, Photo>>>({});
  const mounted = useRef(false);
  const result = useRef<HTMLParagraphElement>(null);
  const pendingPhoto = photos.some(({ key }) => processing[key]);
  const completedData = fields.filter(({ key }) => details[key].trim()).length;
  const completedPhotos = photos.filter(({ key }) => images[key] || savedPhotos.includes(key)).length;
  const total = fields.length + photos.length;

  useEffect(() => {
    mounted.current = true;
    const previews = currentImages.current;
    return () => {
      mounted.current = false;
      Object.values(previews).forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  async function choosePhoto(key: PhotoKey, file?: File) {
    if (!file) return;
    setProcessing((previous) => ({ ...previous, [key]: true }));
    setPhotoErrors((previous) => ({ ...previous, [key]: undefined }));
    try {
      const compressed = await compressIdentityImage(file);
      if (!mounted.current) return;
      const previous = currentImages.current[key];
      if (previous) URL.revokeObjectURL(previous.url);
      const photo = { file: compressed, url: URL.createObjectURL(compressed) };
      currentImages.current[key] = photo;
      setImages((entries) => ({ ...entries, [key]: photo }));
    } catch (error) {
      if (mounted.current) setPhotoErrors((previous) => ({
        ...previous, [key]: error instanceof Error ? error.message : "No se pudo preparar la foto.",
      }));
    } finally {
      if (mounted.current) setProcessing((previous) => ({ ...previous, [key]: false }));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || pendingPhoto) return;
    const error = validateDetails(details);
    if (error || completedPhotos !== photos.length) {
      setNotice(error || "Adjuntá el frente, el reverso y la selfie.");
      requestAnimationFrame(() => result.current?.focus());
      return;
    }

    const form = new FormData(event.currentTarget);
    for (const { key } of photos) {
      const photo = images[key];
      if (photo) form.set(key, photo.file);
    }
    setSending(true);
    setNotice("");
    try {
      const response = await submitIdentity(form);
      setNotice(response.message);
      if (response.ok) router.refresh();
    } catch {
      setNotice("No se pudo enviar. Conservamos tus datos y fotos en esta pantalla para que puedas reintentar.");
    } finally {
      setSending(false);
    }
  }

  return <form className="space-y-5" onSubmit={submit}>
    <div className={`space-y-2 p-4 ${panelClass}`}>
      <div className="flex justify-between gap-2 text-sm">
        <span className="font-semibold">Tu progreso</span>
        <span className="text-white/75">{completedData + completedPhotos} de {total} completos</span>
      </div>
      <progress className="block h-2 w-full overflow-hidden rounded-full accent-[var(--identity-accent)]" aria-label="Progreso de la verificación" max={total} value={completedData + completedPhotos} />
    </div>
    <fieldset disabled={sending} className={`min-w-0 ${panelClass}`}>
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <h2 className="font-semibold">Datos personales</h2>
        <p className="mt-1 text-sm text-white/70">Completalos tal como aparecen en tu cédula.</p>
      </div>
      <div className="divide-y divide-white/10">
        {ci && <div className="grid items-center gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:px-6">
          <span className={labelClass}>Número de CI</span>
          <span className="text-sm font-semibold tabular-nums text-[color:var(--identity-accent)]">{ci}</span>
        </div>}
        {fields.map(({ key, label, type, autoComplete }) => <label key={key} className="grid items-center gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:px-6">
          <span className={labelClass}>{label}{!details[key].trim() && <small className="ml-2 text-xs font-normal text-[color:var(--identity-accent)]">Falta</small>}</span>
          <input name={key} type={type} autoComplete={autoComplete} required maxLength={254} className={inputClass}
            value={details[key]} onChange={(event) => setDetails((previous) => ({ ...previous, [key]: event.target.value }))} />
        </label>)}
      </div>
    </fieldset>
    <fieldset disabled={sending} className={`min-w-0 p-4 sm:p-6 ${panelClass}`}>
      <h2 className="font-semibold">Fotos del documento</h2>
      <p className="mt-1 mb-4 text-sm text-white/70">Sacá una foto o elegila de tu galería. Se comprime en tu dispositivo antes del envío.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {photos.map(({ key, label, hint }) => {
          const photo = images[key];
          const saved = savedPhotos.includes(key);
          return <div key={key} className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-3">
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="text-xs leading-5 text-white/70">{hint}</p>
            <div className="grid aspect-video place-items-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-black/25 text-center text-xs text-white/70">
              {photo ? <img src={photo.url} alt={`Vista previa de ${label.toLowerCase()}`} className="size-full object-contain" />
                : <span className="p-2">{processing[key] ? "Comprimiendo…" : saved ? "Foto guardada" : "Foto pendiente"}</span>}
            </div>
            {photo && <p className="text-xs text-[color:var(--identity-accent)]">Lista · {Math.ceil(photo.file.size / 1000)} KB</p>}
            <label className="relative mt-auto block rounded-lg border border-[color:var(--identity-line)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--identity-accent)] focus-within:outline-2 focus-within:outline-[color:var(--identity-accent)]">
              <span>{processing[key] ? "Preparando foto…" : photo || saved ? "Cambiar foto" : "Elegir foto"}</span>
              <input type="file" aria-label={`${photo || saved ? "Cambiar" : "Elegir"} ${label.toLowerCase()}`}
                accept="image/jpeg,image/png,image/webp" disabled={pendingPhoto} className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-wait"
                onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void choosePhoto(key, file); }} />
            </label>
            {photoErrors[key] && <p role="alert" className="text-xs text-red-200">{photoErrors[key]}</p>}
          </div>;
        })}
      </div>
    </fieldset>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-white/70">JPG, PNG o WebP. Una foto por casilla.</p>
      <button disabled={sending || pendingPhoto} className="min-h-11 w-full rounded-xl bg-[color:var(--identity-accent)] px-5 py-2 font-semibold text-slate-950 disabled:opacity-50 sm:w-auto">
        {sending ? "Enviando a revisión…" : "Enviar a revisión"}
      </button>
    </div>
    <p role="status" tabIndex={-1} ref={result} className="text-sm text-white/90">{notice}</p>
  </form>;
}

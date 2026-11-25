export type VerificationStatus = "unverified" | "pending" | "verified" | "denied" | "rejected";
export type IdentityDetails = { firstName: string; lastName: string; phone: string; email: string; birthDate: string };
export type IdentityPhotos = { front: string; back: string; selfie: string };
export type Registration = { id: string; casinoId: string; ci: string; details: IdentityDetails; photos: IdentityPhotos; status: VerificationStatus; reason: string; submittedAt: string | null; createdAt?: string; lastSignInAt?: string };
export const verificationLabels: Record<VerificationStatus, string> = { unverified: "Sin verificar", pending: "En revisión", verified: "Verificado", denied: "Denegado · corregir", rejected: "Rechazado" };
export const emptyDetails: IdentityDetails = { firstName: "", lastName: "", phone: "", email: "", birthDate: "" };
export const emptyPhotos: IdentityPhotos = { front: "", back: "", selfie: "" };

export function isAdult(birthDate: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const [year, month, day] = birthDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || year < 1900) return false;
  const age = today.getFullYear() - year - Number(today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day));
  return age >= 18;
}
export function validateDetails(details: IdentityDetails): string {
  if (!details.firstName.trim() || !details.lastName.trim()) return "Completá tu nombre y apellido como aparecen en tu CI.";
  if (!/^[+\d ()-]{6,25}$/.test(details.phone) || details.phone.replace(/\D/g, "").length < 6) return "Ingresá un teléfono válido con código de área.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) return "Ingresá un correo electrónico válido.";
  if (!isAdult(details.birthDate)) return "Debés tener al menos 18 años. Revisá tu fecha de nacimiento.";
  return "";
}
export function canSubmitVerification(status: VerificationStatus): boolean { return status === "unverified" || status === "denied"; }
export function canPlay(status: VerificationStatus): boolean { return status === "verified"; }
export function submitVerification(row: Registration, details: IdentityDetails, photos: IdentityPhotos): Registration {
  if (!canSubmitVerification(row.status)) throw new Error("Tu estado actual no permite modificar la solicitud.");
  const error = validateDetails(details);
  if (error) throw new Error(error);
  if (!photos.front || !photos.back || !photos.selfie) throw new Error("Completá las tres fotografías.");
  return { ...row, details, photos, status: "pending", reason: "", submittedAt: new Date().toISOString() };
}
export function reviewVerification(row: Registration, status: "verified" | "denied" | "rejected", reason: string): Registration {
  if (status !== "verified" && !reason.trim()) throw new Error("Indicá el motivo para el jugador.");
  if (status === "verified" && (validateDetails(row.details) || !row.photos.front || !row.photos.back || !row.photos.selfie)) throw new Error("La solicitud debe tener datos válidos y las tres fotos para aprobarla.");
  return { ...row, status, reason: reason.trim() };
}

"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { parseDepositAmount } from "./deposits";
import { playerIdentitySession, type PlayerMovement } from "./house-operations";
import { adminSession, playerAccount } from "./platform";
import { signedHouseDocument, supabaseRequest, uploadHouseDocument } from "./supabase";
import { validateDetails, type IdentityDetails, type IdentityPhotos } from "./verification";

const identityKeys = ["firstName", "lastName", "email", "phone", "birthDate"] as const;
const photoKeys = ["front", "back", "selfie"] as const;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

async function surfaceSlug(surface: "admin" | "casa") {
  const request = await headers();
  return request.get("x-homebet-surface") === surface ? request.get("x-homebet-slug") : null;
}

async function adminAccount() {
  const slug = await surfaceSlug("admin");
  return slug ? adminSession(slug) : null;
}

function readIdentity(form: FormData) {
  const details = Object.fromEntries(identityKeys.map((key) => [key, String(form.get(key) ?? "").trim()])) as IdentityDetails;
  const error = Object.values(details).some((value) => value.length > 254) ? "Revisá la longitud de los datos." : validateDetails(details);
  return { details, error };
}

function refreshPlayers(slug: string) {
  revalidatePath(`/s/admin/${slug}/jugadores`);
  revalidatePath(`/s/admin/${slug}/registros`);
}

export async function loadAdminPlayer(playerId: string) {
  const account = await adminAccount();
  if (!account || !uuid.test(playerId)) return null;
  const { casino, session } = account;
  const [rows, movements] = await Promise.all([
    supabaseRequest<{ identity_files: Partial<IdentityPhotos> }[]>(
      `/rest/v1/profiles?select=identity_files&id=eq.${playerId}&role=eq.player&casino_id=eq.${casino.id}`, session.auth),
    supabaseRequest<PlayerMovement[]>(
      `/rest/v1/ledger_entries?select=id,kind,amount_cents,created_at&player_id=eq.${playerId}&casino_id=eq.${casino.id}&order=created_at.desc&limit=50`, session.auth),
  ]);
  if (!rows[0]) return null;
  const prefix = `${casino.id}/${playerId}/identity/`;
  return { movements, available: photoKeys.filter((key) => rows[0].identity_files[key]?.startsWith(prefix)) };
}

export async function openPlayerDocument(playerId: string, key: keyof IdentityPhotos) {
  const account = await adminAccount();
  if (!account || !uuid.test(playerId) || !photoKeys.includes(key)) return null;
  const { casino, session } = account;
  const [profile] = await supabaseRequest<{ identity_files: Partial<IdentityPhotos> }[]>(
    `/rest/v1/profiles?select=identity_files&id=eq.${playerId}&role=eq.player&casino_id=eq.${casino.id}`, session.auth);
  const path = profile?.identity_files[key];
  return path?.startsWith(`${casino.id}/${playerId}/identity/`) ? signedHouseDocument(path) : null;
}

export async function saveAdminPlayer(form: FormData) {
  const account = await adminAccount();
  const playerId = String(form.get("playerId") ?? "");
  if (account?.casino.status !== "active" || !uuid.test(playerId)) return "No tenés acceso a ese perfil.";
  const { details, error } = readIdentity(form);
  if (error) return error;
  const ok = await supabaseRequest<boolean>("/rest/v1/rpc/update_house_player_details", account.session.auth, {
    target_casino: account.casino.id, target_player: playerId, details,
  });
  if (ok) refreshPlayers(account.casino.slug);
  return ok ? "Datos guardados." : "No se pudo guardar el perfil.";
}

export async function reviewAdminPlayer(playerId: string, decision: "verified" | "denied" | "rejected", reason: string) {
  const account = await adminAccount();
  if (account?.casino.status !== "active" || !uuid.test(playerId)) return "No tenés acceso a ese perfil.";
  reason = reason.trim();
  if (decision !== "verified" && !reason) return "Indicá el motivo de la decisión.";
  const ok = await supabaseRequest<boolean>("/rest/v1/rpc/review_house_player", account.session.auth, {
    target_casino: account.casino.id, target_player: playerId, decision, reason,
  });
  if (ok) refreshPlayers(account.casino.slug);
  return ok ? "Decisión guardada." : "No se pudo actualizar la verificación.";
}

export async function submitIdentity(form: FormData) {
  const slug = await surfaceSlug("casa");
  const account = slug ? await playerIdentitySession(slug) : null;
  if (!account || account.session.profile.verified_at || account.details.verification_decision === "rejected" ||
      (account.details.verification_submitted_at && account.details.verification_decision !== "denied"))
    return { ok: false, message: "La cuenta todavía no admite otra solicitud." };
  const { details, error } = readIdentity(form);
  if (error) return { ok: false, message: error };
  const prefix = `${account.casino.id}/${account.session.profile.id}/identity/${randomUUID()}`;
  try {
    const images = photoKeys.map((key) => form.get(key));
    if (!images.every((file) => file instanceof File && file.size > 0 && file.size <= 1000000))
      return { ok: false, message: "Cargá las tres fotos, de hasta 1 MB cada una." };
    const uploads = await Promise.all(images.map((image, index) => uploadHouseDocument(`${prefix}-${photoKeys[index]}`, image as File, 1000000)));
    const ok = await supabaseRequest<boolean>("/rest/v1/rpc/submit_player_identity", "service", {
      target_casino: account.casino.id, target_player: account.session.profile.id, details,
      files: Object.fromEntries(photoKeys.map((key, index) => [key, uploads[index]])),
    });
    return { ok, message: ok ? "Solicitud enviada a revisión." : "No se pudo enviar la solicitud." };
  } catch {
    return { ok: false, message: "No se pudo enviar. Revisá que las fotos sean JPG, PNG o WebP y volvé a intentar." };
  }
}

export async function submitDeposit(form: FormData) {
  const slug = await surfaceSlug("casa");
  const account = slug ? await playerAccount(slug) : null;
  if (!account) return { ok: false, message: "Ingresá con una cuenta verificada para solicitar una carga." };
  try {
    const receipt = form.get("receipt");
    if (!(receipt instanceof File)) return { ok: false, message: "Adjuntá una imagen del comprobante." };
    const amount = parseDepositAmount(String(form.get("amount") ?? ""));
    if (amount > 100000000) return { ok: false, message: "El importe supera el máximo de la solicitud." };
    const bonus = String(form.get("bonus") ?? "");
    if (bonus && !uuid.test(bonus)) return { ok: false, message: "Elegí un bono válido." };
    const id = String(form.get("requestId") ?? "");
    if (!uuid.test(id)) return { ok: false, message: "La referencia de la solicitud no es válida." };
    const [existing] = await supabaseRequest<{ requested_cents: number; bonus_id: string | null }[]>(
      `/rest/v1/deposit_requests?select=requested_cents,bonus_id&id=eq.${id}&casino_id=eq.${account.casino.id}&player_id=eq.${account.session.profile.id}`,
      account.session.auth,
    );
    if (existing) return existing.requested_cents === amount && existing.bonus_id === (bonus || null)
      ? { ok: true, message: "La solicitud ya está registrada." }
      : { ok: false, message: "Esa referencia ya está vinculada a otra solicitud." };
    const path = await uploadHouseDocument(`${account.casino.id}/${account.session.profile.id}/deposits/${id}.${randomUUID()}`, receipt, 3000000);
    await supabaseRequest("/rest/v1/rpc/submit_player_deposit", "service", {
      target_casino: account.casino.id, target_player: account.session.profile.id, target_id: id,
      requested_amount: amount, receipt: path, bonus: bonus || null,
    });
    return { ok: true, message: "Carga enviada a revisión." };
  } catch {
    return { ok: false, message: "No se pudo enviar la carga. Revisá el monto, el bono y el comprobante." };
  }
}

export async function openDepositReceipt(id: string) {
  const account = await adminAccount();
  if (!account || !uuid.test(id)) return null;
  const [row] = await supabaseRequest<{ receipt_path: string; player_id: string }[]>(
    `/rest/v1/deposit_requests?select=receipt_path,player_id&id=eq.${id}&casino_id=eq.${account.casino.id}`, account.session.auth,
  );
  return row?.receipt_path.startsWith(`${account.casino.id}/${row.player_id}/deposits/`) ? signedHouseDocument(row.receipt_path) : null;
}

export async function resolveDeposit(id: string, decision: "reviewing" | "accepted" | "rejected", reason = "") {
  const account = await adminAccount();
  if (account?.casino.status !== "active" || !uuid.test(id)) return false;
  return supabaseRequest<boolean>("/rest/v1/rpc/review_player_deposit", "service", {
    target_casino: account.casino.id, target_id: id, actor_id: account.session.profile.id, decision, explanation: reason.trim(),
  });
}

export async function createDepositBonus(form: FormData) {
  const account = await adminAccount();
  if (account?.casino.status !== "active") return "No tenés acceso a esta casa.";
  try {
    const name = String(form.get("name") ?? "").trim();
    const kind = String(form.get("kind"));
    const amount = parseDepositAmount(String(form.get("amount") ?? ""));
    const minimum = parseDepositAmount(String(form.get("minimum") ?? ""));
    const maximumInput = String(form.get("maximum") ?? "");
    const maximum = maximumInput ? parseDepositAmount(maximumInput) : null;
    const cap = parseDepositAmount(String(form.get("cap") ?? ""));
    const date = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    const starts = String(form.get("start") ?? "");
    const ends = String(form.get("end") ?? "");
    if (!name || !["fixed", "percentage"].includes(kind) || !date.test(starts) || !date.test(ends) || starts >= ends)
      return "Revisá el tipo y la vigencia del bono.";
    await supabaseRequest("/rest/v1/deposit_bonuses", account.session.auth, {
      casino_id: account.casino.id, name, kind, amount, minimum_cents: minimum, maximum_cents: maximum, cap_cents: cap,
      starts_at: `${starts}:00-03:00`, ends_at: `${ends}:00-03:00`,
    });
    revalidatePath(`/s/admin/${account.casino.slug}/bonos`);
    return "Bono guardado.";
  } catch {
    return "No se pudo guardar el bono. Revisá los montos y las fechas.";
  }
}

export async function saveCashierPlan(form: FormData) {
  const account = await adminAccount();
  if (account?.casino.status !== "active") return "No tenés acceso a esta casa.";
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const mode = String(form.get("mode") ?? "");
  const business = String(form.get("business-name") ?? "").trim();
  const agreement = String(form.get("agreement") ?? "").trim();
  const limit = String(form.get("chip-limit") ?? "");
  const price = String(form.get("access-price") ?? "");
  const positive = /^[1-9][0-9]{0,11}$/;
  if (!name || name.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["internal", "external", "affiliate"].includes(mode) || (mode !== "internal" && !positive.test(limit)) ||
      (mode === "affiliate" && (!business || business.length > 60 || agreement.length > 120 || !positive.test(price))))
    return "Revisá los datos del perfil y sus límites.";
  try {
    await supabaseRequest("/rest/v1/rpc/upsert_cashier_plan", account.session.auth, {
      target_casino: account.casino.id,
      plan: { name, email, mode, business_name: mode === "affiliate" ? business : null,
        agreement: mode === "affiliate" ? agreement : null, access_price_pyg: mode === "affiliate" ? price : null,
        chip_limit: mode !== "internal" ? limit : null },
    });
    revalidatePath(`/s/admin/${account.casino.slug}/admin/cajeros`);
    return "Configuración guardada.";
  } catch {
    return "No se pudo guardar la configuración.";
  }
}

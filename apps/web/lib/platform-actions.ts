"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { catalog } from "./game-library";
import { isSlug, resolveHost } from "./tenant";
import { adminSession, casinoBySlug, homeSession, housePlayers } from "./platform";
import { sessionCookie, sessionCookieOptions, sessionValues, supabaseConfigured, supabaseRequest, type Session } from "./supabase";

type ActionResult = { message: string; ok: boolean };

export async function authenticate(form: FormData): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: false, message: "El acceso todavía no está configurado." };
  const request = await headers();
  const surface = request.get("x-homebet-surface");
  const slug = request.get("x-homebet-slug") ?? "";
  const isPlayer = surface === "casa";
  const identifier = String(form.get(isPlayer ? "ci" : "email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const register = form.get("mode") === "register";
  const validIdentifier = isPlayer ? /^[0-9]{5,15}$/.test(identifier)
    : identifier.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  if (!validIdentifier || password.length < 8 || password.length > 72)
    return { ok: false, message: isPlayer
      ? "Ingresá tu número de CI sin puntos y una contraseña de 8 a 72 caracteres."
      : "Ingresá un correo válido y una contraseña de 8 a 72 caracteres." };

  try {
    const casino = surface === "admin" || isPlayer ? await casinoBySlug(slug) : null;
    if ((surface === "admin" || isPlayer) && casino?.status !== "active")
      return { ok: false, message: "Esta casa no está disponible." };

    // Auth accepts email/password. Use a stable internal identifier scoped to the house.
    const email = isPlayer && casino
      ? `${createHash("sha256").update(`${casino.id}:${identifier}`).digest("hex")}@players.homebet.example`
      : identifier;

    if (register) {
      if (!isPlayer || password !== form.get("confirmation"))
        return { ok: false, message: "Revisá la confirmación de la contraseña." };
      const name = String(form.get("name") ?? "").trim();
      if (name.length < 2 || name.length > 80) return { ok: false, message: "Ingresá tu nombre." };
      await supabaseRequest("/auth/v1/admin/users", "service", {
        email, password, email_confirm: true,
        app_metadata: { player_casino_slug: slug },
        user_metadata: { display_name: name },
      });
    }
    const session = await supabaseRequest<Session & { user: { id: string } }>(
      "/auth/v1/token?grant_type=password", "public", { email, password },
    );
    const [profile] = await supabaseRequest<{ role: string; casino_id: string | null }[]>(
      `/rest/v1/profiles?select=role,casino_id&id=eq.${session.user.id}`, { token: session.access_token },
    );
    const allowed = surface === "home" ? profile?.role === "superadmin"
      : surface === "admin" ? profile?.role === "casino_admin" && profile.casino_id === casino?.id
      : surface === "casa" && profile?.role === "player" && profile.casino_id === casino?.id;
    if (!allowed) return { ok: false, message: "La cuenta no tiene acceso a esta dirección." };
    const jar = await cookies();
    const options = sessionCookieOptions(request.get("host") ?? "");
    for (const [key, value] of Object.entries(sessionValues(session))) jar.set(key, value, options);
    return { ok: true, message: "" };
  } catch {
    return { ok: false, message: isPlayer
      ? register ? "No se pudo crear la cuenta. Si ya te registraste, probá ingresar con tu CI."
        : "No se pudo ingresar. Revisá tu CI y contraseña."
      : "No se pudo completar el acceso. Verificá los datos y la confirmación de tu correo." };
  }
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie.access)?.value;
  if (token) await supabaseRequest("/auth/v1/logout?scope=local", { token }, {}).catch(() => {});
  for (const key of Object.values(sessionCookie)) jar.delete(key);
}

export async function creditChips(form: FormData): Promise<ActionResult> {
  const request = await headers();
  const slug = request.get("x-homebet-slug") ?? "";
  if (request.get("x-homebet-surface") !== "admin" || !slug) return { ok: false, message: "Acceso denegado." };
  const account = await housePlayers(slug);
  const amount = String(form.get("amount") ?? "");
  const playerId = String(form.get("playerId") ?? "");
  const reference = String(form.get("reference") ?? "");
  if (!account || account.session.profile.role !== "casino_admin" || account.casino.status !== "active")
    return { ok: false, message: "Acceso denegado." };
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(amount) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference) ||
    !account.players.some((player) => player.id === playerId))
    return { ok: false, message: "Revisá el jugador y la cantidad de fichas." };

  const [whole, fraction = ""] = amount.split(/[.,]/);
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (cents <= 0 || cents > 100000000) return { ok: false, message: "Ingresá entre 0,01 y 1.000.000 fichas." };
  try {
    await supabaseRequest("/rest/v1/rpc/credit_player_chips", "service", {
      target_casino: account.casino.id, target_player: playerId, actor_id: account.session.profile.id,
      cents, request_ref: reference,
    });
    return { ok: true, message: "Fichas acreditadas." };
  } catch {
    return { ok: false, message: "No se pudo confirmar la acreditación. Podés reintentar la misma operación." };
  }
}


export async function createCasino(form: FormData): Promise<ActionResult> {
  const request = await headers();
  const session = await homeSession();
  if (request.get("x-homebet-surface") !== "home" || !session) return { ok: false, message: "Acceso denegado." };
  const name = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 80 || !isSlug(slug) || resolveHost(`${slug}.localhost`).kind !== "casa")
    return { ok: false, message: "Ingresá un nombre y un slug válido para la casa." };
  try {
    await supabaseRequest("/rest/v1/casinos", session.auth, { name, slug });
    return { ok: true, message: "Casa creada." };
  } catch {
    return { ok: false, message: "No se pudo crear la casa. Comprobá que el slug esté disponible." };
  }
}

export async function publishCatalog(form: FormData) {
  const request = await headers();
  const session = await homeSession();
  if (request.get("x-homebet-surface") !== "home" || !session || form.get("confirm") !== "yes") return;
  await supabaseRequest("/rest/v1/rpc/publish_builtin_catalog", session.auth, {
    definitions: catalog.filter((game) => game.status === "published").map(({ slug, name, version }) => ({ slug, name, version })),
  });
  revalidatePath("/s/home/catalogo");
}

export async function setHouseGame(form: FormData) {
  const request = await headers();
  const slug = request.get("x-homebet-slug") ?? "";
  if (request.get("x-homebet-surface") !== "admin" || !slug) return;
  const account = await adminSession(slug);
  if (account?.casino.status !== "active") return;
  await supabaseRequest("/rest/v1/rpc/set_house_game", account.session.auth, {
    target_game: String(form.get("game") ?? ""), target_enabled: form.get("enabled") === "true",
  });
  revalidatePath(`/s/admin/${slug}/juegos`);
  revalidatePath(`/s/casa/${slug}`, "layout");
}

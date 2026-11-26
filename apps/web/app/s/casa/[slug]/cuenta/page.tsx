import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { PlayerLogin, PlayerProfile } from "@/components/player-profile";
import { defaultAppearance, palettes } from "@/lib/appearance";
import { playerIdentitySession } from "@/lib/house-operations";
import { casinoBySlug, playerAccount, playerHouseSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import { depositStatusLabels, type DepositRequest } from "@/lib/deposits";

const chips = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 2 });

export default function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const house = await casinoBySlug(slug);
    if (!house) return <MissingHouse slug={slug} />;
    if (house.status === "suspended") return <p className="p-4 text-sm text-slate-400">Esta casa está suspendida.</p>;
    const appearance = defaultAppearance(house.name);
    const player = await playerHouseSession(slug);
    if (!player) return <PlayerLogin appearance={appearance} />;

    const verified = Boolean(player.session.profile.verified_at);
    const [identity, wallet] = await Promise.all([
      playerIdentitySession(slug),
      verified ? playerAccount(slug) : Promise.resolve(null),
    ]);
    const details = identity?.details;
    const decision = details?.verification_decision;
    const waiting = Boolean(details?.verification_submitted_at && decision === "pending");
    const rejected = decision === "rejected";
    const needsCorrection = decision === "denied";
    const name = [details?.identity_details.firstName, details?.identity_details.lastName].filter(Boolean).join(" ")
      || player.session.profile.display_name || "Jugador";
    const [latest] = wallet ? await supabaseRequest<{ status: DepositRequest["status"]; requested_cents: number; reason: string }[]>(
      `/rest/v1/deposit_requests?select=status,requested_cents,reason&player_id=eq.${player.session.profile.id}&casino_id=eq.${house.id}&order=created_at.desc&limit=1`,
      player.session.auth,
    ) : [];
    const openLoad = latest && (latest.status === "pending" || latest.status === "reviewing");
    const depositNote = openLoad
      ? `Tu carga de ${chips.format(latest.requested_cents / 100)} fichas está ${depositStatusLabels[latest.status].toLowerCase()}.`
      : latest?.status === "rejected"
        ? `La última carga fue rechazada.${latest.reason ? ` ${latest.reason}` : ""}`
        : null;
    const total = wallet?.balanceCents ?? null;
    const withdrawable = wallet?.withdrawableCents ?? null;
    const state = verified
      ? {
          label: "Cuenta verificada",
          tone: "ok" as const,
          detail: total === null
            ? "Tu cuenta está verificada. El saldo no se pudo leer en este momento."
            : total <= 0
              ? "Tu cuenta está lista. Cargá fichas para jugar. Cuando ganes, el premio queda disponible para retirar."
              : (withdrawable ?? 0) > 0
                ? `Podés jugar con ${chips.format(total / 100)} fichas. ${chips.format((withdrawable ?? 0) / 100)} ya son premios y se pueden retirar.`
                : `Podés jugar con ${chips.format(total / 100)} fichas. Todavía no hay premios para retirar: este saldo viene de cargas o bonos.`,
          primary: total && total > 0 ? { href: "/juegos", label: "Ir a jugar" } : { href: "/cargar", label: "Cargar fichas" },
        }
      : rejected
        ? { label: "Verificación rechazada", tone: "stop" as const, detail: details?.verification_reason || "La casa rechazó la verificación. Si necesitás ayuda, contactá al administrador.", primary: { href: "/verificacion", label: "Ver el motivo" } }
        : needsCorrection
          ? { label: "Hay que corregir los datos", tone: "wait" as const, detail: details?.verification_reason || "Revisá lo que marcó la casa y volvé a enviar las fotos.", primary: { href: "/verificacion", label: "Corregir verificación" } }
          : waiting
            ? { label: "Verificación en revisión", tone: "wait" as const, detail: "La casa está revisando tu CI y tus fotos. Cuando las apruebe vas a poder cargar y jugar.", primary: { href: "/verificacion", label: "Ver mis datos" } }
            : { label: "Falta verificar la cuenta", tone: "wait" as const, detail: "Sin la verificación no podés jugar ni cargar fichas. Completá tu CI y las tres fotos.", primary: { href: "/verificacion", label: "Completar verificación" } };
    const links = [
      verified && state.primary.href !== "/cargar" ? { href: "/cargar", label: "Cargar fichas", hint: "Enviá el comprobante y esperá la acreditación." } : null,
      verified ? { href: "/saldo", label: "Movimientos", hint: "Cargas, apuestas y premios de esta cuenta." } : null,
      state.primary.href !== "/verificacion" ? { href: "/verificacion", label: "Datos y verificación", hint: "CI, contacto y fotos de tu documento." } : null,
    ].filter((link) => link !== null);
    const palette = palettes[appearance.palette];

    return <PlayerProfile
      name={name}
      ci={details?.identity_number ?? ""}
      label={state.label}
      detail={state.detail}
      tone={state.tone}
      totalCents={total}
      withdrawableCents={withdrawable}
      depositNote={depositNote}
      primary={state.primary}
      links={links}
      accent={palette.accent}
      ink={palette.ink}
    />;
  }}</HouseGate>;
}

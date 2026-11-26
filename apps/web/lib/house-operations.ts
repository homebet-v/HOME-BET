import "server-only";

import { adminSession, playerHouseSession } from "./platform";
import { supabaseRequest } from "./supabase";
import { emptyDetails, emptyPhotos, type IdentityDetails, type IdentityPhotos, type Registration } from "./verification";
import type { LedgerKind } from "./wallet";
import type { DepositBonus, DepositRequest } from "./deposits";

type DirectoryRow = {
  id: string; display_name: string | null; identity_number: string | null;
  identity_details: Partial<IdentityDetails>; verification_decision: "pending" | "denied" | "rejected";
  verification_reason: string; verification_submitted_at: string | null;
  created_at: string; verified_at: string | null; last_sign_in_at: string | null; balance_cents: number; withdrawable_cents: number;
};
export type DirectoryPlayer = Registration & { balanceCents: number; withdrawableCents: number };
export type PlayerMovement = { id: string; kind: LedgerKind; amount_cents: number; created_at: string };
export type DepositRow = DepositRequest & { receiptAvailable: boolean };

export async function housePlayerDirectory(slug: string) {
  const account = await adminSession(slug);
  if (!account) return null;
  const { casino, session } = account;
  const players = await supabaseRequest<DirectoryRow[]>("/rest/v1/rpc/house_player_directory", session.auth, { target_casino: casino.id });
  return { ...account, players: players.map((row): DirectoryPlayer => ({
    id: row.id, casinoId: casino.id, ci: row.identity_number ?? "",
    details: { ...emptyDetails, firstName: row.display_name ?? "", ...row.identity_details },
    photos: emptyPhotos, status: row.verified_at ? "verified" : row.verification_decision,
    balanceCents: row.balance_cents, withdrawableCents: row.withdrawable_cents, reason: row.verification_reason, submittedAt: row.verification_submitted_at,
    createdAt: row.created_at, lastSignInAt: row.last_sign_in_at ?? undefined,
  })) };
}

type DatabaseDeposit = {
  id: string; casino_id: string; player_id: string; requested_cents: number; receipt_path: string; created_at: string;
  status: DepositRequest["status"]; claimed_by: string | null; reviewed_at: string | null; reason: string;
  bonus_cents: number; bonus_id: string | null;
};

export async function houseDeposits(slug: string) {
  const account = await adminSession(slug);
  if (!account) return null;
  const rows = await supabaseRequest<DatabaseDeposit[]>(
    `/rest/v1/deposit_requests?select=*&casino_id=eq.${account.casino.id}&order=created_at.desc,id.desc`, account.session.auth,
  );
  return {
    ...account,
    deposits: rows.map((row): DepositRow => ({
      id: row.id, casinoId: row.casino_id, playerId: row.player_id, requestedCents: row.requested_cents,
      receiptAvailable: Boolean(row.receipt_path), receiptUrl: "", createdAt: row.created_at,
      status: row.status, claimedBy: row.claimed_by, reviewedAt: row.reviewed_at, reason: row.reason,
      bonusCents: row.bonus_cents, bonus: null, confirmedCents: row.status === "accepted" ? row.requested_cents : null,
    })),
  };
}

type DatabaseBonus = {
  id: string; casino_id: string; name: string; kind: DepositBonus["kind"]; amount: number;
  minimum_cents: number; maximum_cents: number | null; cap_cents: number; starts_at: string; ends_at: string;
};

export async function houseBonuses(casinoId: string, auth: { token: string }) {
  const rows = await supabaseRequest<DatabaseBonus[]>(
    `/rest/v1/deposit_bonuses?select=*&casino_id=eq.${casinoId}&order=starts_at.desc`, auth,
  );
  return rows.map((row): DepositBonus => ({
    id: row.id, casinoId: row.casino_id, name: row.name, kind: row.kind, amount: row.amount,
    minimumCents: row.minimum_cents, maximumCents: row.maximum_cents, capCents: row.cap_cents,
    startsAt: row.starts_at, endsAt: row.ends_at,
  }));
}

export async function playerIdentitySession(slug: string) {
  const account = await playerHouseSession(slug);
  if (!account) return null;
  const { casino, session } = account;
  const [details] = await supabaseRequest<{
    identity_number: string | null; identity_details: Partial<IdentityDetails>; identity_files: Partial<IdentityPhotos>; identity_draft_saved_at: string | null;
    verification_decision: "pending" | "denied" | "rejected"; verification_reason: string; verification_submitted_at: string | null;
  }[]>(`/rest/v1/profiles?select=identity_number,identity_details,identity_files,identity_draft_saved_at,verification_decision,verification_reason,verification_submitted_at&id=eq.${session.profile.id}`, session.auth);
  return details ? { casino, session, details } : null;
}

import { HouseGate } from "@/components/house-gate";
import { WithdrawalQueue, type WithdrawalQueueItem } from "@/components/withdrawal-queue";
import { adminSession } from "@/lib/platform";
import { supabaseRequest } from "@/lib/supabase";
import type { WithdrawalStatus } from "@/lib/withdrawals";

type Row = {
  id: string;
  player_id: string;
  status: WithdrawalStatus;
  requested_cents: number;
  created_at: string;
  destination: string;
  payout_method: "alias" | "bank";
  holder_name: string;
  bank_name: string;
  account_number: string;
  payout_identity: string;
};

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await adminSession(slug);
    if (!account) return null;
    const rows = await supabaseRequest<Row[]>(
      `/rest/v1/withdrawal_requests?select=id,player_id,status,requested_cents,created_at,destination,payout_method,holder_name,bank_name,account_number,payout_identity&casino_id=eq.${account.casino.id}&order=created_at.desc&limit=50`,
      account.session.auth,
    );
    const ids = [...new Set(rows.map((row) => row.player_id))];
    const people = ids.length ? await supabaseRequest<{ id: string; display_name: string }[]>(
      `/rest/v1/profiles?select=id,display_name&casino_id=eq.${account.casino.id}&id=in.(${ids.join(",")})`,
      account.session.auth,
    ) : [];
    const names = new Map(people.map((person) => [person.id, person.display_name]));
    const requests: WithdrawalQueueItem[] = rows.map((row) => ({
      id: row.id,
      playerName: names.get(row.player_id) || "Jugador",
      status: row.status,
      requestedCents: row.requested_cents,
      createdAt: row.created_at,
      method: row.payout_method,
      holderName: row.holder_name,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      payoutIdentity: row.payout_identity,
      destination: row.destination,
    }));
    return <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Retiros</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Cada pedido muestra cómo cobrarle al jugador. Las fichas ya salieron al solicitarlo. Pagado confirma que ya le pagaste. Rechazar devuelve las fichas.</p>
      </div>
      {requests.length ? <WithdrawalQueue requests={requests} /> : <p className="text-sm text-slate-300">Todavía no hay solicitudes de retiro.</p>}
    </section>;
  }}</HouseGate>;
}

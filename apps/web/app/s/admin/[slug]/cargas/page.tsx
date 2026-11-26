import { HouseGate } from "@/components/house-gate";
import { CreditChipsForm } from "@/components/credit-chips-form";
import { DepositReview } from "@/components/deposit-review";
import { houseDeposits, housePlayerDirectory } from "@/lib/house-operations";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const [queue, directory] = await Promise.all([houseDeposits(slug), housePlayerDirectory(slug)]);
    if (!queue || !directory) return null;
    const players = directory.players.filter((player) => player.status === "verified")
      .map((player) => ({ id: player.id, display_name: [player.details.firstName, player.details.lastName].filter(Boolean).join(" ") }));
    return <div className="space-y-5">
      <DepositReview casinoId={queue.casino.id} requests={queue.deposits} players={directory.players} reviewer={queue.session.profile.id} />
      {players.length > 0 && <details className="space-y-4 rounded-xl border border-white/10 p-4">
        <summary className="cursor-pointer font-semibold">Acreditación manual</summary>
        <CreditChipsForm players={players} />
      </details>}
    </div>;
  }}</HouseGate>;
}

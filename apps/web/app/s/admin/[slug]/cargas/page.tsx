import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { CreditChipsForm } from "@/components/credit-chips-form";
import { housePlayers } from "@/lib/platform";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const data = await housePlayers(slug);
    if (!data) return null;
    return <section className="space-y-4">
      <h1 className="text-xl font-bold">Acreditar fichas</h1>
      {data.players.length ? <CreditChipsForm players={data.players} /> : <p>Las cuentas aparecerán cuando los jugadores se registren en esta casa.</p>}
      <Link className="text-sm underline" href="/jugadores">Ver jugadores</Link>
    </section>;
  }}</HouseGate>;
}

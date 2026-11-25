import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { CasinoLobby } from "@/components/casino-lobby";
import { defaultAppearance } from "@/lib/appearance";
import { houseBySlug, enabledCatalog } from "@/lib/fixtures";
export const metadata = { title: "Ingresar · Mi casa" };
export default function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => {
    const house = houseBySlug(slug);
    if (!house) return <MissingHouse slug={slug} />;
    if (house.status === "suspended") return <p className="text-sm text-slate-400">Esta casa está suspendida.</p>;
    return <CasinoLobby appearance={defaultAppearance(house.name)} games={enabledCatalog(slug)} initialAccess />;
  }}</HouseGate>;
}

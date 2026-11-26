import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { CasinoLobby } from "@/components/casino-lobby";
import { defaultAppearance } from "@/lib/appearance";
import { casinoBySlug, publicHouseCatalog } from "@/lib/platform";
export const metadata = { title: "Ingresar · Mi casa" };
export default function AccountPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const house = await casinoBySlug(slug);
    if (!house) return <MissingHouse slug={slug} />;
    if (house.status === "suspended") return <p className="text-sm text-slate-400">Esta casa está suspendida.</p>;
    return <CasinoLobby appearance={defaultAppearance(house.name)} games={await publicHouseCatalog(slug)} initialAccess />;
  }}</HouseGate>;
}

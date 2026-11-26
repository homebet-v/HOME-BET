import { CasinoLobby } from "@/components/casino-lobby";
import { defaultAppearance } from "@/lib/appearance";
import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { casinoBySlug, publicHouseCatalog } from "@/lib/platform";

async function Lobby({ slug }: { slug: string }) {
  const house = await casinoBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;

  const games = await publicHouseCatalog(slug);
  const suspended = house.status === "suspended";

  return suspended ? <p className="text-sm text-zinc-400">Esta casa está suspendida.</p> : <CasinoLobby appearance={defaultAppearance(house.name)} games={games} framed={false} />;

}

export default function CasaHomePage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Lobby slug={slug} />}</HouseGate>;
}

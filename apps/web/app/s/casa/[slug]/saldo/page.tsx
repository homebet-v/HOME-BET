import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { WalletDemo } from "@/components/wallet-demo";
import { houseBySlug } from "@/lib/fixtures";
export const metadata = { title: "Simulación de saldo · Mi casa" };
export default function WalletPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <WalletDemo key={slug} /> : <MissingHouse slug={slug} />}</HouseGate>;
}

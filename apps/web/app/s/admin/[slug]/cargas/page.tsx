import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { DepositReview } from "@/components/deposit-review";
import { houseBySlug } from "@/lib/fixtures";

export const metadata = { title: "Cargas · Mi casino" };
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <DepositReview casinoId={slug} /> : <MissingHouse slug={slug} />}</HouseGate>;
}

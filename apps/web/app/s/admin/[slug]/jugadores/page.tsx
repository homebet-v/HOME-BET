import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { RegistrationReview } from "@/components/registration-review";
import { houseBySlug } from "@/lib/fixtures";

export const metadata = { title: "Jugadores · Mi casino" };
export default function AdminPlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => houseBySlug(slug) ? <RegistrationReview casinoId={slug} mode="players" /> : <MissingHouse slug={slug} />}</HouseGate>;
}

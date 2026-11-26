import { HouseGate } from "@/components/house-gate";
import { RegistrationReview } from "@/components/registration-review";
import { housePlayerDirectory } from "@/lib/house-operations";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const directory = await housePlayerDirectory(slug);
    if (!directory) return null;
    return <RegistrationReview players={directory.players} houseName={directory.casino.name} mode="registrations" />;
  }}</HouseGate>;
}

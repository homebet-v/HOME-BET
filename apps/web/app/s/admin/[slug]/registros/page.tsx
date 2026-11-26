import { HousePlayerList } from "@/components/house-player-list";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <HousePlayerList params={params} title="Registros" />;
}

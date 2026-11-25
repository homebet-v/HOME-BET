import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { AppearanceEditor } from "@/components/appearance-editor";
import { enabledCatalog, houseBySlug } from "@/lib/fixtures";

export const metadata = { title: "Apariencia · Mi casino" };
function Editor({ slug }: { slug: string }) {
  const house = houseBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;
  return <AppearanceEditor key={slug} name={house.name} games={enabledCatalog(slug)} />;
}
export default function AppearancePage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Editor slug={slug} />}</HouseGate>;
}

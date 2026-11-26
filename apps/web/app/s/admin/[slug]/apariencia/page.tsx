import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { AppearanceEditor } from "@/components/appearance-editor";
import { adminSession, publicHouseCatalog } from "@/lib/platform";

export const metadata = { title: "Apariencia · Mi casino" };
async function Editor({ slug }: { slug: string }) {
  const house = (await adminSession(slug))?.casino;
  if (!house) return <MissingHouse slug={slug} />;
  return <AppearanceEditor key={slug} name={house.name} games={await publicHouseCatalog(slug)} />;
}
export default function AppearancePage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Editor slug={slug} />}</HouseGate>;
}

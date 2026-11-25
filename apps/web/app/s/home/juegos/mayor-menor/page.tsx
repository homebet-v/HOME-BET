import { HigherLowerDemo } from "@/components/higher-lower-demo";
import { engineDemos } from "@/components/engine-demos";

export const metadata = { title: `${engineDemos.cards.title} · Homebet` };

export default function CardsPage() {
  return <HigherLowerDemo />;
}

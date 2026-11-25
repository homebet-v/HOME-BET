import { MinesDemo } from "@/components/mines-demo";
import { engineDemos } from "@/components/engine-demos";

export const metadata = { title: `${engineDemos.mines.title} · Homebet` };

export default function MinesPage() {
  return <MinesDemo />;
}

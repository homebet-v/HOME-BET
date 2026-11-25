import { PlinkoDemo } from "@/components/plinko-demo";
import { engineDemos } from "@/components/engine-demos";

export const metadata = { title: `${engineDemos.plinko.title} · Homebet` };

export default function DemoPage() {
  return <PlinkoDemo />;
}

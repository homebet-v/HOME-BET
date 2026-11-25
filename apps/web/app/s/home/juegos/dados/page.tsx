import { EngineDemo } from "@/components/engine-demo";
import { engineDemos } from "@/components/engine-demos";

export const metadata = { title: `${engineDemos.dice.title} · Homebet` };

export default function DemoPage() {
  return <EngineDemo />;
}

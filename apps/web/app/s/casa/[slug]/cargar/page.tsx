import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { playerAccount } from "@/lib/platform";

export const metadata = { title: "Cargar fichas" };
export default function LoadPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const account = await playerAccount(slug);
    return <section className="space-y-3 p-4">
      <h1 className="text-xl font-semibold">Cargar fichas</h1>
      {account ? <p>Solicitá una acreditación al administrador de tu casa.</p> : <Link href="/cuenta">Ingresá a tu cuenta para consultar tus fichas</Link>}
    </section>;
  }}</HouseGate>;
}

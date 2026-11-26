import Link from "next/link";
import { HouseGate } from "@/components/house-gate";
import { adminSession } from "@/lib/platform";
import { surfaceOrigin } from "@/lib/tenant";

export const metadata = { title: "Resumen del casino" };
export default function AdminOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{async (slug) => {
    const data = await adminSession(slug);
    if (!data) return null;
    return <section className="space-y-4" data-screen="admin-resumen">
      <h1 className="text-2xl font-bold">{data.casino.name}</h1>
      <ul className="space-y-3 text-sm">
        <li><Link href="/jugadores">Jugadores</Link></li>
        <li><Link href="/cargas">Acreditar fichas</Link></li>
        <li><Link href="/juegos">Juegos</Link></li>
        <li><a href={surfaceOrigin("casa", slug, process.env.NEXT_PUBLIC_ROOT_DOMAIN)}>Abrir la casa</a></li>
      </ul>
    </section>;
  }}</HouseGate>;
}

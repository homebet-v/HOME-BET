import { HouseGate } from "@/components/house-gate";
import { MissingHouse } from "@/components/missing-house";
import { houseBySlug } from "@/lib/fixtures";
import { surfaceOrigin } from "@/lib/tenant";

function Domain({ slug }: { slug: string }) {
  const house = houseBySlug(slug);
  if (!house) return <MissingHouse slug={slug} />;

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";
  const casa = surfaceOrigin("casa", slug, root);
  const admin = surfaceOrigin("admin", slug, root);

  return (
    <div className="flex flex-col gap-8" data-screen="admin-dominio">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Dominio</h1>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          Home y este panel ven los mismos hosts.
        </p>
      </section>
      <dl className="grid gap-3">
        <div className="rounded-2xl border border-white/10 p-4">
          <dt className="text-sm text-zinc-400">Casa de jugadores</dt>
          <dd className="mt-2">
            <a className="underline" href={casa}>
              {casa}
            </a>
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 p-4">
          <dt className="text-sm text-zinc-400">Este panel</dt>
          <dd className="mt-2">
            <a className="underline" href={admin}>
              {admin}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function AdminDomainPage({ params }: { params: Promise<{ slug: string }> }) {
  return <HouseGate params={params}>{(slug) => <Domain slug={slug} />}</HouseGate>;
}

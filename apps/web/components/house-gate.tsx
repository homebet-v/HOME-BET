import { Suspense, type ReactNode } from "react";

async function ReadSlug({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: (slug: string) => ReactNode;
}) {
  const { slug } = await params;
  return children(slug);
}

export function HouseGate({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: (slug: string) => ReactNode;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Cargando la casa…</p>}>
      <ReadSlug params={params}>{children}</ReadSlug>
    </Suspense>
  );
}

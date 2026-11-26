import { Suspense, type ReactNode } from "react";

async function ReadSlug({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: (slug: string) => ReactNode | Promise<ReactNode>;
}) {
  const { slug } = await params;
  return children(slug);
}

export function HouseGate({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: (slug: string) => ReactNode | Promise<ReactNode>;
}) {
  return (
    <Suspense fallback={null}>
      <ReadSlug params={params}>{children}</ReadSlug>
    </Suspense>
  );
}

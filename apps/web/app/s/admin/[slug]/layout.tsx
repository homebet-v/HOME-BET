import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { houseBySlug } from "@/lib/fixtures";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = houseBySlug(slug)?.name ?? "Casino";
  return {
    title: { absolute: name },
    description: `Panel de ${name}.`,
  };
}


async function AdminFrame({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  return (
    <AdminShell name={houseBySlug(slug)?.name ?? slug}>
      {children}
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AdminShell name="Mi casino">
          <p className="text-sm text-zinc-500">Cargando la casa…</p>
        </AdminShell>
      }
    >
      <AdminFrame params={params}>{children}</AdminFrame>
    </Suspense>
  );
}

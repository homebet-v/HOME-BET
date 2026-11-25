import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { houseBySlug } from "@/lib/fixtures";


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

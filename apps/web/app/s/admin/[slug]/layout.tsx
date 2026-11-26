import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { PlatformPanelLogin } from "@/components/platform-panel-login";
import { adminSession } from "@/lib/platform";

export const metadata: Metadata = { title: "Administración · Homebet" };

async function AuthorizedAdmin({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  const { slug } = await params;
  const authorized = await adminSession(slug);
  if (!authorized) return <PlatformPanelLogin title="Ingresar al panel de la casa" />;
  return <AdminShell name={authorized.casino.name}>{children}</AdminShell>;
}

export default function AdminLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<p className="p-6">Cargando la casa…</p>}><AuthorizedAdmin params={params}>{children}</AuthorizedAdmin></Suspense>;
}

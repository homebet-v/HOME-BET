import { Suspense, type ReactNode } from "react";
import { HomeFrame } from "@/components/home-frame";
import { SignOut } from "@/components/platform-login";
import { PlatformPanelLogin } from "@/components/platform-panel-login";
import { homeSession } from "@/lib/platform";

async function AuthorizedHome({ children }: { children: ReactNode }) {
  if (!await homeSession()) return <PlatformPanelLogin title="Ingresar a Home" />;
  return <HomeFrame><div className="mb-4 flex justify-end"><SignOut /></div>{children}</HomeFrame>;
}

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<p className="p-6">Cargando Home…</p>}><AuthorizedHome>{children}</AuthorizedHome></Suspense>;
}

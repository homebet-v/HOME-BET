import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { GameAssetCache } from "@/components/game-asset-cache";
import { HouseFrame, HouseFrameFromHost } from "@/components/house-frame";
import { PlayerSessionProvider } from "@/components/player-session";
import { casinoBySlug, playerAccount, playerHouseSession } from "@/lib/platform";
import { defaultAppearance } from "@/lib/appearance";
import { MissingHouse } from "@/components/missing-house";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = (await casinoBySlug(slug))?.name ?? "Casino";
  return {
    title: { absolute: name },
    description: `${name}. La casa de juegos.`,
  };
}

async function CasaFrame({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  const { slug } = await params;
  const [house, account, player] = await Promise.all([casinoBySlug(slug), playerAccount(slug), playerHouseSession(slug)]);
  if (!house) return <MissingHouse slug={slug} />;
  if (house.status !== "active") return <p className="p-6">Esta casa está suspendida.</p>;
  const appearance = defaultAppearance(house.name);
  return (
    <PlayerSessionProvider key={slug} account={player ? { displayName: player.session.profile.display_name, identityNumber: player.session.profile.identity_number, balanceCents: account?.balanceCents ?? null, verified: Boolean(account) } : null}>
      <GameAssetCache />
      <HouseFrame appearance={appearance}>
        <main className="min-w-0 pb-24">{children}</main>
      </HouseFrame>
    </PlayerSessionProvider>
  );
}
export default function CasaLayout({ params, children }: { params: Promise<{ slug: string }>; children: ReactNode }) {
  return <Suspense fallback={<HouseFrameFromHost />}><CasaFrame params={params}>{children}</CasaFrame></Suspense>;
}

"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { createDemoRegistration, loginDemoRegistration, useRegistrations } from "@/lib/registration-demo";
import { canPlay, emptyDetails, emptyPhotos, type Registration } from "@/lib/verification";
import type { WalletMovement } from "@/lib/wallet";
export const demoPlayer = { ci: "1234567", password: "123456789", name: "Jugador de prueba", verified: true } as const;
export const demoWalletMovements: WalletMovement[] = [{ id: "demo-load", type: "deposit", amountCents: 1000000 }, { id: "demo-stake", type: "stake", amountCents: 100000 }, { id: "demo-prize", type: "prize", amountCents: 1100000 }];
type DemoState = { signedIn: boolean; player: Registration | null; canPlay: boolean; signIn: (ci: string, password: string) => void; register: (ci: string, password: string) => void; signOut: () => void; movements: WalletMovement[]; setMovements: Dispatch<SetStateAction<WalletMovement[]>> };
const DemoContext = createContext<DemoState | null>(null);
export function DemoPlayerProvider({ children, casinoId }: { children: ReactNode; casinoId: string }) {
  const rows = useRegistrations();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const player: Registration | null = playerId === "demo" ? { id: "demo", casinoId, ci: demoPlayer.ci, details: { ...emptyDetails, firstName: "Jugador", lastName: "de prueba" }, photos: emptyPhotos, status: "verified", reason: "", submittedAt: null } : rows.find((row) => row.id === playerId && row.casinoId === casinoId) ?? null;
  return <DemoContext.Provider value={{ signedIn: !!player, player, canPlay: !!player && canPlay(player.status), movements, setMovements,
    signIn: (ci, password) => {
      if (ci === demoPlayer.ci && password === demoPlayer.password) { setPlayerId("demo"); setMovements(demoWalletMovements); return; }
      const account = loginDemoRegistration(casinoId, ci, password);
      if (!account) throw new Error("CI o contraseña incorrectos. Las cuentas de muestra se reinician al recargar.");
      setPlayerId(account.id); setMovements([]);
    },
    register: (ci, password) => { const account = createDemoRegistration(casinoId, ci, password); setPlayerId(account.id); setMovements([]); },
    signOut: () => { setPlayerId(null); setMovements([]); }
  }}>{children}</DemoContext.Provider>;
}
export function useDemoPlayer() { return useContext(DemoContext); }

"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PlayerSession = { displayName: string | null; balanceCents: number } | null;
const PlayerContext = createContext<PlayerSession>(null);

export function PlayerSessionProvider({ account, children }: { account: PlayerSession; children: ReactNode }) {
  return <PlayerContext.Provider value={account}>{children}</PlayerContext.Provider>;
}

export function usePlayerSession() {
  return useContext(PlayerContext);
}

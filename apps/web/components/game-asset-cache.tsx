"use client";

import { useEffect } from "react";

export function GameAssetCache() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/homebet-game-cache.js").catch(() => {});
  }, []);
  return null;
}

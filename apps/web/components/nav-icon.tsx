import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  "/category/slots": <><rect x="3" y="5" width="16" height="15" rx="2" /><path d="M6 9h10v7H6zM9 9v7m4-7v7m6-6h2V5m-14 15v1m8-1v1" /><circle cx="21" cy="3" r="1" /></>,
  "/category/roulette": <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6l3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6" /></>,
  "/category/cards": <><path d="m7 5-3 1a2 2 0 0 0-1.3 2.5L6 19a2 2 0 0 0 2.5 1.3l3-1" /><rect x="9" y="3" width="12" height="17" rx="2" /><path d="m15 8-3 4 3 4 3-4-3-4Z" /></>,
  "/category/instant": <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
  "/inicio": <><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9Z" /><path d="M9 20v-7h6v7" /></>,
  "/cargar": <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M4 9h16m-5.5 5.5h3M8 12v5m-2.5-2.5h5" /></>,
  "/perfil": <><circle cx="12" cy="7.5" r="3.5" /><path d="M5 20v-2a7 7 0 0 1 14 0v2" /></>,
  "/casino-juegos": <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>,
  "/casas": <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7" /><path d="M10 9h4" /></>,
  "/dominios": <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 7h14M5 17h14" /></>,
  "/fichas": <><ellipse cx="10" cy="6" rx="7" ry="3" /><path d="M3 6v5c0 1.7 3.1 3 7 3m7-8v3M3 11v5c0 1.7 3.1 3 7 3" /><circle cx="17" cy="16" r="5" /><path d="M17 13.5v5m-1.5-3.5H18m-2 2h2" /></>,
  "/proveedores": <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9L4 7.5m8 4.5 8-4.5M12 12v9M8 5.3l8 4.5" /></>,
  "/catalogo": <><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="8" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /><path d="M14 16h7m-7 4h5" /></>,
  "/": <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  "/cuentas": <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 9h18M7 15h4m5 0h1" /></>,
  "/cargas": <><path d="M12 3v11m-4-4 4 4 4-4M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" /></>,
  "/retiros": <><path d="M12 15V4m-4 4 4-4 4 4M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" /></>,
  "/registros": <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M9 4V2h6v2M8 10h8m-8 4h5m-5 3h3m4 0 1.5 1.5L19 16" /></>,
  "/jugadores": <><circle cx="9" cy="7" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2" /></>,
  "/mensajes": <><path d="M8 19H5l-3 3V6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-7" /><path d="M7 8h10M7 12h7" /></>,
  "/historial": <><path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6" /><path d="M12 7v5l3 2" /></>,
  "/admin": <><path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  "/apariencia": <><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.5 1.5 0 0 1 1.1-2.5H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" /><circle cx="7.5" cy="10" r=".7" /><circle cx="11" cy="6.5" r=".7" /><circle cx="16" cy="8" r=".7" /><circle cx="6.5" cy="15" r=".7" /></>,
  "/juegos": <><rect x="4" y="4" width="16" height="16" rx="4" transform="rotate(-8 12 12)" /><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" strokeWidth="2.8" /></>,
  "/dominio": <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 7h14M5 17h14" /></>,
  "/bonos": <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12" /><path d="M12 8H8a2.5 2.5 0 1 1 2.5-2.5L12 8Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 8Z" /></>,
  "/admin/cajeros": <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M6 16a3 3 0 0 1 6 0m3-7h3m-3 4h3M8 4V2m8 2V2" /></>,
};

export function NavIcon({ href, className = "" }: { href: string; className?: string }) {
  return <svg className={`shrink-0 ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[href] ?? icons["/admin"]}</svg>;
}

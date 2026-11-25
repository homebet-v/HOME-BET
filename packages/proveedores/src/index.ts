/**
 * Taller de juegos. Un juego se construye acá y se publica en
 * public.games / public.game_versions del Supabase de la plataforma.
 * Este paquete no abre una base de datos.
 */
export type GameDraft = {
  slug: string;
  name: string;
  version: string;
};

export const gameDrafts: readonly GameDraft[] = [
  { slug: "dados", name: "Dados", version: "0.3.0" },
  { slug: "plinko", name: "Plinko", version: "0.1.0" },
  { slug: "minas", name: "Bóveda de Jade", version: "0.1.0" },
  { slug: "mayor-menor", name: "Cámara Carmesí", version: "0.1.0" },
];

export * from "./slot-engine";
export * from "./slot-catalog";

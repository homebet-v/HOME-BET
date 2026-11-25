export const homeSections = [
  {
    label: null,
    items: [{ href: "/", label: "Resumen" }],
  },
  {
    label: "Casinos",
    items: [
      { href: "/casas", label: "Casinos" },
      { href: "/dominios", label: "Dominios" },
      { href: "/fichas", label: "Fichas" },
    ],
  },
  {
    label: "Juegos",
    items: [
      { href: "/proveedores", label: "Proveedores" },
      { href: "/juegos", label: "Taller" },
      { href: "/catalogo", label: "Catálogo" },
    ],
  },
] as const;

export const operationNav = [
  { href: "/cuentas", label: "Cuentas" },
  { href: "/cargas", label: "Cargas" },
  { href: "/retiros", label: "Retiros" },
  { href: "/registros", label: "Registros" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/historial", label: "Historial" },
] as const;
export const managementNav = [
  { href: "/bonos", label: "Bonos" },
  { href: "/admin", label: "Vista general" },
  { href: "/apariencia", label: "Apariencia" },
  { href: "/juegos", label: "Juegos" },
  { href: "/dominio", label: "Dominio" },
  { href: "/admin/cajeros", label: "Cajeros" },
] as const;
export const adminNav = [{ href: "/", label: "Resumen" }, ...operationNav, ...managementNav] as const;

export const casaNav = [
  { href: "/", label: "Inicio" },
  { href: "/juegos", label: "Juegos" },
  { href: "/cuenta", label: "Cuenta" },
] as const;

const amount = new Intl.NumberFormat("es", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(cents: number): string {
  return amount.format(cents / 100);
}

const statusLabel = {
  active: "Activa",
  suspended: "Suspendida",
  published: "Publicado",
  retired: "Retirado",
} as const;

export function labelForStatus(status: keyof typeof statusLabel): string {
  return statusLabel[status];
}

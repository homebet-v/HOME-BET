import { OperationPlaceholder } from "@/components/operation-placeholder";

export const metadata = { title: "Historial · Mi casino" };

export default function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <OperationPlaceholder params={params} title="Historial" description="Espacio para consultar los movimientos y las acciones operativas de esta casa." columns={["Fecha", "Operación", "Jugador", "Responsable", "Estado"]} empty="El historial de operaciones aparecerá aquí." />;
}

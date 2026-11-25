import { OperationPlaceholder } from "@/components/operation-placeholder";
export const metadata = { title: "Retiros \u00b7 Mi casino" };
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
return <OperationPlaceholder params={params} title="Retiros" description="Revisión de solicitudes y seguimiento de pagos a los jugadores de esta casa." columns={["Solicitud", "Jugador", "Importe", "Cajero", "Estado", "Fecha"]} empty="Las solicitudes de retiro aparecerán aquí." />;
}

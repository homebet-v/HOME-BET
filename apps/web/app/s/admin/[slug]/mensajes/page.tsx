import { OperationPlaceholder } from "@/components/operation-placeholder";
export const metadata = { title: "Mensajes \u00b7 Mi casino" };
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
return <OperationPlaceholder params={params} title="Mensajes" description="Bandeja para la atención de jugadores y el seguimiento de conversaciones por cajero." columns={["Conversación", "Jugador", "Cajero asignado", "Estado", "Último mensaje"]} empty="Las conversaciones aparecerán aquí." />;
}

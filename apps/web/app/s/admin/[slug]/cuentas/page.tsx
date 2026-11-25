import { OperationPlaceholder } from "@/components/operation-placeholder";

export const metadata = { title: "Cuentas · Mi casino" };

export default function AccountsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <OperationPlaceholder params={params} title="Cuentas" description="Sección de cuentas de esta casa, pendiente de definir su funcionamiento." columns={["Cuenta", "Estado"]} empty="Las cuentas aparecerán aquí." />;
}

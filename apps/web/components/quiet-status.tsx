import { labelForStatus } from "@/lib/format";

export function QuietStatus({
  status,
}: {
  status: "active" | "suspended" | "published" | "retired";
}) {
  return <span className="text-zinc-300">{labelForStatus(status)}</span>;
}

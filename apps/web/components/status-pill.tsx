import { labelForStatus } from "@/lib/format";

const tone = {
  active: "border-emerald-400/40 text-emerald-200",
  suspended: "border-amber-400/40 text-amber-200",
  published: "border-sky-400/40 text-sky-200",
  retired: "border-zinc-500 text-zinc-300",
} as const;

export function StatusPill({ status }: { status: keyof typeof tone }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${tone[status]}`}>
      {labelForStatus(status)}
    </span>
  );
}

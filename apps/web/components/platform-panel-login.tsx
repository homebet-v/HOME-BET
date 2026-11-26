import { PlatformLogin } from "@/components/platform-login";

export function PlatformPanelLogin({ title }: { title: string }) {
  return <main className="mx-auto w-full max-w-sm space-y-5 p-6">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <PlatformLogin />
  </main>;
}

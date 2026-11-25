export default function UnknownSurfacePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-6 py-24" data-screen="unknown">
      <p className="text-sm text-zinc-500">Homebet</p>
      <h1 className="text-2xl font-semibold">Este host no es una casa</h1>
      <p className="text-sm leading-6 text-zinc-400">
        Home responde en localhost. Una casa responde en su slug y el panel en ese slug con el sufijo -admin.
      </p>
    </main>
  );
}
export function MissingHouse({ slug }: { slug: string }) {
  return (
    <section className="flex flex-col gap-2" data-screen="missing-house">
      <h1 className="text-xl font-semibold">{slug}</h1>
      <p className="max-w-xl text-sm leading-6 text-zinc-400">
        Esta casa todavía no está registrada en Home.
      </p>
    </section>
  );
}

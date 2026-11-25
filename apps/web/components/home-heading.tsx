export function HomeHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="flex max-w-xl flex-col gap-3 border-b border-white/10 pb-6">
      <p className="text-[11px] tracking-[0.16em] text-zinc-500 uppercase">{kicker}</p>
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <p className="text-sm leading-6 text-zinc-400">{lede}</p>
    </header>
  );
}

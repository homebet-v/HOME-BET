"use client";

import { useState } from "react";

type Field = {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
};

export function PendingForm({
  title,
  description,
  fields,
  submitLabel,
  quiet = false,
}: {
  title: string;
  description: string;
  fields: readonly Field[];
  submitLabel: string;
  quiet?: boolean;
}) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <section className={quiet ? "flex flex-col gap-4 border-t border-white/10 pt-8" : "rounded-2xl border border-white/10 p-5"}>
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setNote("Nada se guardó. Supabase no está conectado.");
        }}
      >
        {fields.map((field) => (
          <div key={field.id} className="grid gap-1 text-sm">
            <label htmlFor={field.id} className="text-zinc-300">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            />
          </div>
        ))}
        <div className="flex flex-col items-start gap-3 sm:col-span-2">
          <button
            type="submit"
            className={
              quiet
                ? "border border-white/20 px-4 py-2 text-sm text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                : "rounded-full bg-white px-4 py-2 text-sm font-medium text-black outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            }
          >
            {submitLabel}
          </button>
          {note ? (
            <p role="status" className="text-sm text-amber-200">
              {note}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

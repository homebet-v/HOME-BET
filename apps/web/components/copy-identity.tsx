"use client";

import { useState } from "react";

export function CopyIdentity({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return <button type="button" aria-label={copied ? "CI copiado" : "Copiar CI"} className="inline-flex size-5 shrink-0 items-center justify-center rounded text-slate-400 hover:text-white" onClick={async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }}>
    {copied ? <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.2 4.7 8.7 9.8 3.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>}
  </button>;
}

"use client";

import { useState } from "react";

export default function RoastExport({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the textarea is selectable as a fallback.
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-accent">Exportar para el roast</h2>
          <p className="text-xs text-muted">
            Copiá esto y pegáselo a Claude para que escriba el resumen.
          </p>
        </div>
        <button
          onClick={copy}
          className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg hover:brightness-95"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        rows={Math.min(24, text.split("\n").length + 1)}
        onFocus={(e) => e.currentTarget.select()}
        className="resize-y rounded-md border border-line bg-background px-3 py-2 font-mono text-xs leading-relaxed text-fg outline-none"
      />
    </div>
  );
}

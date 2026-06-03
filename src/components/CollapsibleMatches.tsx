"use client";

import { useState, type ReactNode } from "react";

export default function CollapsibleMatches({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted hover:border-accent hover:text-accent"
        >
          {open
            ? "Ocultar partidos anteriores"
            : `Ver partidos anteriores (${count})`}
        </button>
        <span className="h-px flex-1 bg-line" />
      </div>
      {open && children}
    </div>
  );
}

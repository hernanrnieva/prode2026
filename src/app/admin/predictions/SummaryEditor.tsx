"use client";

import { useActionState } from "react";
import { setDaySummary, type AdminActionState } from "@/lib/actions/admin";

const initialState: AdminActionState = {};

export default function SummaryEditor({
  dayKey,
  initialBody,
}: {
  dayKey: string;
  initialBody: string;
}) {
  const [state, action, pending] = useActionState(setDaySummary, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4"
    >
      <input type="hidden" name="dayKey" value={dayKey} />
      <label className="text-sm font-bold text-accent">Resumen de la fecha</label>
      <p className="text-xs text-muted">
        Recap que verán todos en la tabla. La <strong>primera línea</strong> es el
        título; lo que sigue, el cuerpo. Dejalo vacío para borrarlo.
      </p>
      <textarea
        name="body"
        defaultValue={initialBody}
        rows={5}
        placeholder={"Título de la fecha\n\nResumen de la jornada…"}
        className="resize-y rounded-md border border-line bg-background px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/50 focus:border-accent"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="self-start rounded-md bg-accent px-4 py-1.5 text-sm font-bold text-accent-fg hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar resumen"}
        </button>
        {state.error && <span className="text-sm text-danger">{state.error}</span>}
        {state.ok && !pending && (
          <span className="text-sm font-semibold text-accent">Guardado ✓</span>
        )}
      </div>
    </form>
  );
}

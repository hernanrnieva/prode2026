"use client";

import { useActionState } from "react";
import { savePrediction, type PredictionState } from "@/lib/actions/predictions";

const initialState: PredictionState = {};

export default function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  prediction,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  prediction: { homeScore: number; awayScore: number } | null;
}) {
  const [state, formAction, pending] = useActionState(savePrediction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="matchId" value={matchId} />
      <label className="flex flex-col gap-1 text-xs text-muted">
        {homeTeam}
        <input
          name="homeScore"
          type="number"
          min={0}
          defaultValue={prediction?.homeScore ?? ""}
          required
          className="w-16 rounded-md border border-line bg-background px-2 py-1 text-base text-fg outline-none focus:border-accent"
        />
      </label>
      <span className="pb-1.5 text-muted">–</span>
      <label className="flex flex-col gap-1 text-xs text-muted">
        {awayTeam}
        <input
          name="awayScore"
          type="number"
          min={0}
          defaultValue={prediction?.awayScore ?? ""}
          required
          className="w-16 rounded-md border border-line bg-background px-2 py-1 text-base text-fg outline-none focus:border-accent"
        />
      </label>
      <button
        disabled={pending}
        className="rounded-md bg-accent px-4 py-1.5 text-sm font-bold text-accent-fg hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Guardando…" : prediction ? "Actualizar" : "Guardar"}
      </button>
      {state.error && <span className="text-sm text-danger">{state.error}</span>}
      {state.ok && !pending && (
        <span className="text-sm font-semibold text-accent">Guardado ✓</span>
      )}
    </form>
  );
}

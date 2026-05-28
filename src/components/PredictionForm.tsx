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
      <label className="flex flex-col text-xs text-gray-500">
        {homeTeam}
        <input
          name="homeScore"
          type="number"
          min={0}
          defaultValue={prediction?.homeScore ?? ""}
          required
          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
        />
      </label>
      <span className="pb-1.5 text-gray-400">–</span>
      <label className="flex flex-col text-xs text-gray-500">
        {awayTeam}
        <input
          name="awayScore"
          type="number"
          min={0}
          defaultValue={prediction?.awayScore ?? ""}
          required
          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
        />
      </label>
      <button
        disabled={pending}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : prediction ? "Actualizar" : "Guardar"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state.ok && !pending && (
        <span className="text-sm font-medium text-green-700">Guardado ✓</span>
      )}
    </form>
  );
}

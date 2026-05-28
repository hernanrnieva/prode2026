"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createMatch, type MatchState } from "@/lib/actions/matches";

const initialState: MatchState = {};

export default function AddMatchForm() {
  const [state, formAction, pending] = useActionState(createMatch, initialState);
  const [kickoffLocal, setKickoffLocal] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form after a successful submission (no error, not pending).
  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
      setKickoffLocal("");
    }
  }, [state, pending]);

  // Convert the naive datetime-local value (in the admin's browser timezone)
  // to a UTC ISO string so the server stores an unambiguous instant.
  const kickoffIso = kickoffLocal ? new Date(kickoffLocal).toISOString() : "";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4"
    >
      <h3 className="font-semibold">Agregar partido</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="homeTeam"
          placeholder="Local"
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        <input
          name="awayTeam"
          placeholder="Visitante"
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>
      <input
        type="datetime-local"
        value={kickoffLocal}
        onChange={(e) => setKickoffLocal(e.target.value)}
        required
        className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
      />
      <input type="hidden" name="kickoffAt" value={kickoffIso} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar partido"}
      </button>
    </form>
  );
}

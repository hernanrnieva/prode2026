"use client";

import { useState } from "react";
import { clearResult, deleteMatch, setResult } from "@/lib/actions/matches";

export type AdminMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  dayKey: string;
  dayLabel: string;
  timeLabel: string;
  finished: boolean;
  homeScore: number | null;
  awayScore: number | null;
};

export default function AdminMatchList({ matches }: { matches: AdminMatch[] }) {
  const [showFinished, setShowFinished] = useState(false);
  const finishedCount = matches.filter((m) => m.finished).length;
  const visible = matches.filter((m) => showFinished || !m.finished);

  // matches arrive pre-sorted by kickoff ascending, so insertion order keeps
  // both the day groups and the matches within each day chronological.
  const groups = new Map<string, AdminMatch[]>();
  for (const m of visible) {
    const list = groups.get(m.dayKey);
    if (list) list.push(m);
    else groups.set(m.dayKey, [m]);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Partidos ({matches.length})</h2>
        {finishedCount > 0 && (
          <button
            onClick={() => setShowFinished((v) => !v)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {showFinished
              ? "Ocultar finalizados"
              : `Mostrar finalizados (${finishedCount})`}
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no cargaste partidos.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todos los partidos están finalizados.
        </p>
      ) : (
        [...groups.values()].map((dayMatches) => (
          <section key={dayMatches[0].dayKey} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {dayMatches[0].dayLabel}
            </h3>
            <ul className="flex flex-col gap-3">
              {dayMatches.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 rounded-md border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {m.homeTeam} vs {m.awayTeam}
                    </span>
                    <span className="text-sm text-gray-500">{m.timeLabel}</span>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <form action={setResult} className="flex items-end gap-2">
                      <input type="hidden" name="matchId" value={m.id} />
                      <label className="flex flex-col text-xs text-gray-500">
                        {m.homeTeam}
                        <input
                          name="homeScore"
                          type="number"
                          min={0}
                          defaultValue={m.homeScore ?? ""}
                          required
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
                        />
                      </label>
                      <span className="pb-1.5 text-gray-400">–</span>
                      <label className="flex flex-col text-xs text-gray-500">
                        {m.awayTeam}
                        <input
                          name="awayScore"
                          type="number"
                          min={0}
                          defaultValue={m.awayScore ?? ""}
                          required
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
                        />
                      </label>
                      <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                        {m.finished ? "Actualizar" : "Cargar resultado"}
                      </button>
                    </form>

                    {m.finished && (
                      <form action={clearResult}>
                        <input type="hidden" name="matchId" value={m.id} />
                        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                          Reabrir
                        </button>
                      </form>
                    )}

                    <form action={deleteMatch} className="ml-auto">
                      <input type="hidden" name="matchId" value={m.id} />
                      <button className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                        Eliminar
                      </button>
                    </form>
                  </div>

                  {m.finished && (
                    <span className="text-xs font-medium text-green-700">
                      Finalizado: {m.homeScore} – {m.awayScore}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}

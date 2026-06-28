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
  deletable: boolean;
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
        <h2 className="text-lg font-bold">Partidos ({matches.length})</h2>
        {finishedCount > 0 && (
          <button
            onClick={() => setShowFinished((v) => !v)}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {showFinished
              ? "Ocultar finalizados"
              : `Mostrar finalizados (${finishedCount})`}
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="text-sm text-muted">Todavía no cargaste partidos.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted">
          Todos los partidos están finalizados.
        </p>
      ) : (
        [...groups.values()].map((dayMatches) => (
          <section key={dayMatches[0].dayKey} className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {dayMatches[0].dayLabel}
            </h3>
            <ul className="flex flex-col gap-3">
              {dayMatches.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">
                      {m.homeTeam} <span className="text-muted">vs</span> {m.awayTeam}
                    </span>
                    <span className="text-sm text-muted tabular-nums">{m.timeLabel}</span>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <form action={setResult} className="flex items-end gap-2">
                      <input type="hidden" name="matchId" value={m.id} />
                      <label className="flex flex-col gap-1 text-xs text-muted">
                        {m.homeTeam}
                        <input
                          name="homeScore"
                          type="number"
                          min={0}
                          defaultValue={m.homeScore ?? ""}
                          required
                          className="w-16 rounded-md border border-line bg-background px-2 py-1 text-base text-fg outline-none focus:border-accent"
                        />
                      </label>
                      <span className="pb-1.5 text-muted">–</span>
                      <label className="flex flex-col gap-1 text-xs text-muted">
                        {m.awayTeam}
                        <input
                          name="awayScore"
                          type="number"
                          min={0}
                          defaultValue={m.awayScore ?? ""}
                          required
                          className="w-16 rounded-md border border-line bg-background px-2 py-1 text-base text-fg outline-none focus:border-accent"
                        />
                      </label>
                      <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-fg hover:brightness-95">
                        {m.finished ? "Actualizar" : "Cargar resultado"}
                      </button>
                    </form>

                    {m.finished && (
                      <form action={clearResult}>
                        <input type="hidden" name="matchId" value={m.id} />
                        <button className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-muted hover:bg-card-hover hover:text-fg">
                          Reabrir
                        </button>
                      </form>
                    )}

                    {m.deletable && (
                      <form action={deleteMatch} className="ml-auto">
                        <input type="hidden" name="matchId" value={m.id} />
                        <button className="rounded-md border border-danger/50 px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger/10">
                          Eliminar
                        </button>
                      </form>
                    )}
                  </div>

                  {m.finished && (
                    <span className="text-xs font-semibold text-accent">
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

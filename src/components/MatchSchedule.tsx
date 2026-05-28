"use client";

import { useEffect, useState } from "react";
import PredictionForm from "@/components/PredictionForm";

export type ScheduledMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffIso: string;
  finished: boolean;
  homeScore: number | null;
  awayScore: number | null;
  prediction: { homeScore: number; awayScore: number; points: number | null } | null;
};

function dateKey(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function kickoffTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchSchedule({ matches }: { matches: ScheduledMatch[] }) {
  // Grouping uses the viewer's local timezone, so render only after mount to
  // keep the server (UTC) and client markup identical and avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
  }, []);

  if (!mounted) {
    return <p className="text-sm text-gray-500">Cargando partidos…</p>;
  }

  if (matches.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay partidos cargados. Volvé más tarde.
      </p>
    );
  }

  // matches arrive pre-sorted by kickoff ascending, so insertion order keeps
  // both the day groups and the matches within each day chronological.
  const groups = new Map<string, ScheduledMatch[]>();
  for (const m of matches) {
    const key = dateKey(m.kickoffIso);
    const list = groups.get(key);
    if (list) list.push(m);
    else groups.set(key, [m]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([day, dayMatches]) => (
        <section key={day} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {day}
          </h2>
          <ul className="flex flex-col gap-3">
            {dayMatches.map((m) => {
              const locked = m.finished || new Date(m.kickoffIso).getTime() <= now;
              return (
                <li
                  key={m.id}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {m.homeTeam} vs {m.awayTeam}
                    </span>
                    <span className="text-sm text-gray-500">
                      {kickoffTime(m.kickoffIso)}
                    </span>
                  </div>

                  {m.finished && (
                    <span className="text-xs font-medium text-green-700">
                      Resultado final: {m.homeScore} – {m.awayScore}
                    </span>
                  )}

                  {locked ? (
                    <span className="text-sm text-gray-600">
                      {m.prediction ? (
                        <>
                          Tu pronóstico: {m.prediction.homeScore} – {m.prediction.awayScore}
                          {m.finished && m.prediction.points !== null && (
                            <span className="ml-2 font-medium text-blue-700">
                              +{m.prediction.points} pts
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">Sin pronóstico</span>
                      )}
                      {!m.finished && (
                        <span className="ml-2 text-xs text-gray-400">(cerrado)</span>
                      )}
                    </span>
                  ) : (
                    <PredictionForm
                      matchId={m.id}
                      homeTeam={m.homeTeam}
                      awayTeam={m.awayTeam}
                      prediction={m.prediction}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

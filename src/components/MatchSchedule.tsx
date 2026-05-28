import PredictionForm from "@/components/PredictionForm";

export type ScheduledMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  dayKey: string;
  dayLabel: string;
  timeLabel: string;
  finished: boolean;
  locked: boolean;
  homeScore: number | null;
  awayScore: number | null;
  prediction: { homeScore: number; awayScore: number; points: number | null } | null;
};

export default function MatchSchedule({ matches }: { matches: ScheduledMatch[] }) {
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
    const list = groups.get(m.dayKey);
    if (list) list.push(m);
    else groups.set(m.dayKey, [m]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.values()].map((dayMatches) => (
        <section key={dayMatches[0].dayKey} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {dayMatches[0].dayLabel}
          </h2>
          <ul className="flex flex-col gap-3">
            {dayMatches.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-md border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {m.homeTeam} vs {m.awayTeam}
                  </span>
                  <span className="text-sm text-gray-500">{m.timeLabel}</span>
                </div>

                {m.finished && (
                  <span className="text-xs font-medium text-green-700">
                    Resultado final: {m.homeScore} – {m.awayScore}
                  </span>
                )}

                {m.locked ? (
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
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

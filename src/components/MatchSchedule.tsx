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
      <p className="text-sm text-muted">
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
    <div className="flex flex-col gap-8">
      {[...groups.values()].map((dayMatches) => (
        <section key={dayMatches[0].dayKey} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {dayMatches[0].dayLabel}
          </h2>
          <ul className="flex flex-col gap-3">
            {dayMatches.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-line/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {m.homeTeam} <span className="text-muted">vs</span> {m.awayTeam}
                  </span>
                  <span className="text-sm text-muted tabular-nums">{m.timeLabel}</span>
                </div>

                {m.finished && (
                  <span className="text-xs font-semibold text-accent">
                    Resultado final: {m.homeScore} – {m.awayScore}
                  </span>
                )}

                {m.locked ? (
                  <span className="text-sm text-muted">
                    {m.prediction ? (
                      <>
                        Tu pronóstico:{" "}
                        <span className="font-semibold text-fg">
                          {m.prediction.homeScore} – {m.prediction.awayScore}
                        </span>
                        {m.finished && m.prediction.points !== null && (
                          <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                            +{m.prediction.points} pts
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted/60">Sin pronóstico</span>
                    )}
                    {!m.finished && (
                      <span className="ml-2 text-xs text-muted/60">(cerrado)</span>
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

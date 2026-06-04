import PredictionForm from "@/components/PredictionForm";
import CollapsibleMatches from "@/components/CollapsibleMatches";
import { dayKey } from "@/lib/dates";

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
  prediction: {
    homeScore: number;
    awayScore: number;
    points: number | null;
    auto: boolean;
  } | null;
};

// Group a pre-sorted list into per-day buckets, preserving order.
function groupByDay(matches: ScheduledMatch[]): ScheduledMatch[][] {
  const groups = new Map<string, ScheduledMatch[]>();
  for (const m of matches) {
    const list = groups.get(m.dayKey);
    if (list) list.push(m);
    else groups.set(m.dayKey, [m]);
  }
  return [...groups.values()];
}

function DayGroup({ dayMatches }: { dayMatches: ScheduledMatch[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {dayMatches[0].dayLabel}
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                {m.prediction && !m.prediction.auto ? (
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
                ) : m.prediction && m.prediction.auto ? (
                  <>
                    <span className="text-muted/60">Sin pronóstico</span>{" "}
                    <span className="text-fg">· 0 – 0 automático</span>
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
  );
}

export default function MatchSchedule({ matches }: { matches: ScheduledMatch[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay partidos cargados. Volvé más tarde.
      </p>
    );
  }

  // Matches arrive pre-sorted by kickoff ascending. We split into three:
  //  - upcoming/live (not locked) lead the page, soonest first
  //  - recent results (already played yesterday or today) stay visible
  //  - older results collapse behind a toggle, most recent day first
  // "Yesterday" is an Argentina-time YYYY-MM-DD key, so the cutoff is a plain
  // lexicographic string comparison.
  const yesterdayKey = dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const upcoming = matches.filter((m) => !m.locked);
  const recentPast = matches.filter((m) => m.locked && m.dayKey >= yesterdayKey);
  const oldPast = matches.filter((m) => m.locked && m.dayKey < yesterdayKey);

  const upcomingGroups = groupByDay(upcoming);
  const recentPastGroups = groupByDay(recentPast).reverse();
  const oldPastGroups = groupByDay(oldPast).reverse();

  return (
    <div className="flex flex-col gap-8">
      {upcomingGroups.length > 0 ? (
        upcomingGroups.map((g) => <DayGroup key={g[0].dayKey} dayMatches={g} />)
      ) : (
        <p className="text-sm text-muted">
          No hay próximos partidos. ¡Atento a la próxima fecha!
        </p>
      )}

      {recentPastGroups.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Resultados recientes
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          {recentPastGroups.map((g) => (
            <DayGroup key={g[0].dayKey} dayMatches={g} />
          ))}
        </>
      )}

      {oldPast.length > 0 && (
        <CollapsibleMatches count={oldPast.length}>
          <div className="flex flex-col gap-8">
            {oldPastGroups.map((g) => (
              <DayGroup key={g[0].dayKey} dayMatches={g} />
            ))}
          </div>
        </CollapsibleMatches>
      )}
    </div>
  );
}

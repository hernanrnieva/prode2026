import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel, timeLabel } from "@/lib/dates";
import DateSelect from "./DateSelect";
import SummaryEditor from "./SummaryEditor";
import RoastExport from "./RoastExport";

type AdminMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  finished: boolean;
  homeScore: number | null;
  awayScore: number | null;
  preds: {
    username: string;
    name: string | null;
    homeScore: number;
    awayScore: number;
    points: number | null;
    auto: boolean;
  }[];
};

// UTC range covering one Argentina-local day (fixed -03:00, no DST), so it
// lines up with dayKey()'s Argentina-time grouping.
function dayRangeUtc(key: string): { gte: Date; lt: Date } {
  const gte = new Date(`${key}T00:00:00-03:00`);
  const lt = new Date(gte.getTime() + 24 * 60 * 60 * 1000);
  return { gte, lt };
}

export default async function AdminPredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  // Lightweight pass over every match to build the date picker.
  const all = await prisma.match.findMany({
    orderBy: { kickoffAt: "asc" },
    select: { kickoffAt: true, status: true },
  });

  if (all.length === 0) {
    return <p className="text-sm text-muted">Todavía no hay partidos cargados.</p>;
  }

  const dayMap = new Map<
    string,
    { key: string; label: string; count: number; hasUpcoming: boolean }
  >();
  for (const m of all) {
    const key = dayKey(m.kickoffAt);
    const entry = dayMap.get(key);
    if (entry) {
      entry.count += 1;
      if (m.status !== "FINISHED") entry.hasUpcoming = true;
    } else {
      dayMap.set(key, {
        key,
        label: dayLabel(m.kickoffAt),
        count: 1,
        hasUpcoming: m.status !== "FINISHED",
      });
    }
  }
  const days = [...dayMap.values()];

  // Default to the requested day, else the soonest day with a pending match,
  // else the most recent day.
  const selected =
    (date && dayMap.has(date) && date) ||
    days.find((d) => d.hasUpcoming)?.key ||
    days[days.length - 1].key;

  const summary = await prisma.daySummary.findUnique({
    where: { dayKey: selected },
    select: { body: true },
  });

  const { gte, lt } = dayRangeUtc(selected);
  const rows = await prisma.match.findMany({
    where: { kickoffAt: { gte, lt } },
    orderBy: { kickoffAt: "asc" },
    select: {
      id: true,
      homeTeam: true,
      awayTeam: true,
      kickoffAt: true,
      status: true,
      homeScore: true,
      awayScore: true,
      predictions: {
        where: { user: { role: { not: "ADMIN" } } },
        select: {
          homeScore: true,
          awayScore: true,
          points: true,
          auto: true,
          user: { select: { username: true, name: true } },
        },
      },
    },
  });

  const matches: AdminMatch[] = rows.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    kickoffAt: m.kickoffAt,
    finished: m.status === "FINISHED",
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    preds: m.predictions
      .map((p) => ({
        username: p.user.username,
        name: p.user.name,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        points: p.points,
        auto: p.auto,
      }))
      .sort(
        (a, b) =>
          (b.points ?? -1) - (a.points ?? -1) ||
          a.username.localeCompare(b.username),
      ),
  }));

  // Paste-ready dump of the day for writing the roast: match + result, then
  // each player's pick (no-shows flagged).
  const roastText = matches
    .map((m) => {
      const head = m.finished
        ? `${m.homeTeam} vs ${m.awayTeam} — Resultado: ${m.homeScore} – ${m.awayScore}`
        : `${m.homeTeam} vs ${m.awayTeam} — (sin resultado todavía)`;
      const lines = m.preds.map(
        (p) =>
          `${p.username}${p.auto ? " (sin pronóstico)" : ""}\n${p.homeScore} – ${p.awayScore}`,
      );
      return [head, ...(lines.length ? lines : ["(nadie pronosticó)"])].join("\n");
    })
    .join("\n\n");

  return (
    <section className="flex flex-col gap-5">
      <DateSelect
        days={days.map((d) => ({ key: d.key, label: d.label, count: d.count }))}
        selected={selected}
      />

      <SummaryEditor
        key={selected}
        dayKey={selected}
        initialBody={summary?.body ?? ""}
      />

      <RoastExport key={`export-${selected}`} text={roastText} />

      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">
                {m.homeTeam} <span className="text-muted">vs</span> {m.awayTeam}
              </span>
              <span className="text-right text-xs text-muted">
                <span className="block tabular-nums">{timeLabel(m.kickoffAt)}</span>
                {m.finished && (
                  <span className="font-semibold text-accent">
                    Final: {m.homeScore} – {m.awayScore}
                  </span>
                )}
              </span>
            </div>

            {m.preds.length === 0 ? (
              <p className="text-sm text-muted/60">Sin pronósticos.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {m.preds.map((p) => (
                  <li
                    key={p.username}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex flex-col">
                      <span className="text-fg">
                        {p.username}
                        {p.auto && (
                          <span className="ml-1.5 text-xs text-muted/50">
                            (sin pronóstico)
                          </span>
                        )}
                      </span>
                      {p.name && (
                        <span className="text-xs text-muted/60">{p.name}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-fg">
                        {p.homeScore} – {p.awayScore}
                      </span>
                      {p.points != null && (
                        <span className="w-12 rounded-full bg-accent/15 px-2 py-0.5 text-center text-xs font-bold text-accent">
                          +{p.points}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

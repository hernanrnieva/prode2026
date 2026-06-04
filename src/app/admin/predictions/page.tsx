import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel, timeLabel } from "@/lib/dates";

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
  }[];
};

export default async function AdminPredictionsPage() {
  const rows = await prisma.match.findMany({
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
      }))
      .sort(
        (a, b) =>
          (b.points ?? -1) - (a.points ?? -1) ||
          a.username.localeCompare(b.username),
      ),
  }));

  // Group by day (ascending input → ascending within day), then show newest
  // day first.
  const groups = new Map<string, AdminMatch[]>();
  for (const m of matches) {
    const key = dayKey(m.kickoffAt);
    const list = groups.get(key);
    if (list) list.push(m);
    else groups.set(key, [m]);
  }
  const dayGroups = [...groups.values()].reverse();

  if (matches.length === 0) {
    return <p className="text-sm text-muted">Todavía no hay partidos cargados.</p>;
  }

  return (
    <section className="flex flex-col gap-8">
      {dayGroups.map((dayMatches) => (
        <section key={dayKey(dayMatches[0].kickoffAt)} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {dayLabel(dayMatches[0].kickoffAt)}
          </h2>

          {dayMatches.map((m) => (
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
                        <span className="text-fg">{p.username}</span>
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
        </section>
      ))}
    </section>
  );
}

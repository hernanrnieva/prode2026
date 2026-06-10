import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel } from "@/lib/dates";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isApproved(user) && !isAdmin(user)) redirect("/");

  // Finished matches with everyone's predictions. Safe to expose because the
  // match is over — revealing locked predictions can't help anyone cheat.
  const finishedMatches = await prisma.match.findMany({
    where: { status: "FINISHED" },
    orderBy: { kickoffAt: "asc" },
    select: {
      id: true,
      homeTeam: true,
      awayTeam: true,
      kickoffAt: true,
      homeScore: true,
      awayScore: true,
      predictions: {
        // Admins run the prode and don't compete — keep them out of the view.
        where: { user: { role: { not: "ADMIN" } } },
        select: {
          homeScore: true,
          awayScore: true,
          points: true,
          auto: true,
          user: { select: { username: true } },
        },
      },
    },
  });

  // Most recent match-day (Argentina time) that has a finished match.
  let lastDayKey: string | null = null;
  let lastDayLabel = "";
  for (const m of finishedMatches) {
    const key = dayKey(m.kickoffAt);
    if (lastDayKey === null || key > lastDayKey) {
      lastDayKey = key;
      lastDayLabel = dayLabel(m.kickoffAt);
    }
  }

  // Detail for the last finished day: each match + every player's prediction.
  const lastDayMatches = finishedMatches
    .filter((m) => lastDayKey && dayKey(m.kickoffAt) === lastDayKey)
    .map((m) => ({
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      preds: [...m.predictions]
        .map((p) => ({
          username: p.user.username,
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          points: p.points ?? 0,
          auto: p.auto,
        }))
        .sort(
          (a, b) => b.points - a.points || a.username.localeCompare(b.username),
        ),
    }));

  const players = await prisma.user.findMany({
    // Admins run the prode; they don't compete, so keep them off the table.
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    select: {
      username: true,
      predictions: {
        select: {
          points: true,
          auto: true,
          match: { select: { kickoffAt: true, status: true } },
        },
      },
    },
  });

  const rows = players
    .map((p) => {
      let total = 0;
      let lastDay = 0;
      let played = 0;
      for (const pred of p.predictions) {
        if (pred.points === null) continue;
        total += pred.points;
        // Auto 0-0 defaults count for points but aren't a real "played" match.
        if (!pred.auto) played += 1;
        if (
          lastDayKey &&
          pred.match.status === "FINISHED" &&
          dayKey(pred.match.kickoffAt) === lastDayKey
        ) {
          lastDay += pred.points;
        }
      }
      return { username: p.username, total, lastDay, played };
    })
    .sort((a, b) => b.total - a.total || a.username.localeCompare(b.username));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Tabla de <span className="text-accent">posiciones</span>
        </h1>
        <Link href="/" className="text-sm font-semibold text-fg hover:text-accent">
          ← Volver
        </Link>
      </header>

      <table className="w-full border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="w-8 py-2 pl-4 font-semibold">#</th>
            <th className="py-2 font-semibold">Jugador</th>
            {lastDayKey && (
              <th className="py-2 pr-2 text-right font-semibold">
                Última fecha
                <span className="block text-xs font-normal normal-case text-muted/60">
                  {lastDayLabel}
                </span>
              </th>
            )}
            <th className="py-2 pr-4 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isMe = r.username === user.username;
            const hi = isMe ? "bg-accent/10" : "";
            // Podium gets larger type, tapering 1 → 2 → 3; everyone else equal.
            const size =
              i === 0
                ? "text-2xl"
                : i === 1
                  ? "text-xl"
                  : i === 2
                    ? "text-lg"
                    : "text-sm";
            return (
              <tr key={r.username} className={size}>
                <td
                  className={`rounded-l-lg py-3 pl-4 pr-2 font-bold tabular-nums ${
                    i === 0 ? "text-accent" : "text-muted"
                  } ${hi}`}
                >
                  {i + 1}
                </td>
                <td className={`py-3 ${hi}`}>
                  <span className="font-semibold">{r.username}</span>
                  <span className="ml-2 text-xs text-muted/60">
                    {r.played} jugados
                  </span>
                </td>
                {lastDayKey && (
                  <td
                    className={`py-3 pr-2 text-right tabular-nums text-muted ${hi}`}
                  >
                    {r.lastDay > 0 ? `+${r.lastDay}` : "—"}
                  </td>
                )}
                <td
                  className={`rounded-r-lg py-3 pl-2 pr-4 text-right font-bold tabular-nums text-accent ${hi}`}
                >
                  {r.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {lastDayKey && lastDayMatches.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold">Pronósticos de la última fecha</h2>
            <p className="text-sm text-muted">{lastDayLabel}</p>
          </div>
          {lastDayMatches.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  {m.homeTeam} <span className="text-muted">vs</span> {m.awayTeam}
                </span>
                <span className="text-xs font-semibold text-accent">
                  Final: {m.homeScore} – {m.awayScore}
                </span>
              </div>
              {m.preds.length === 0 ? (
                <p className="text-sm text-muted/60">Nadie pronosticó este partido.</p>
              ) : (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {m.preds.map((p) => (
                    <li
                      key={p.username}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-muted">
                        {p.username}
                        {p.auto && (
                          <span className="ml-1.5 text-xs text-muted/50">
                            (sin pronóstico)
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 tabular-nums">
                        <span
                          className={`font-semibold ${p.auto ? "text-muted" : "text-fg"}`}
                        >
                          {p.homeScore} – {p.awayScore}
                        </span>
                        <span className="w-12 rounded-full bg-accent/15 px-2 py-0.5 text-center text-xs font-bold text-accent">
                          +{p.points}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

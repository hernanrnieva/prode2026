import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel } from "@/lib/dates";
import { basePoints, extraPoints, isExactScore } from "@/lib/scoring";
import Leaderboard from "@/components/Leaderboard";

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
          homeScore: true,
          awayScore: true,
          match: {
            select: {
              kickoffAt: true,
              status: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
      },
    },
  });

  // Latest admin-written match-day recap. Stays up until a newer one is added.
  const latestSummary = await prisma.daySummary.findFirst({
    orderBy: { dayKey: "desc" },
    select: { dayKey: true, body: true },
  });
  const summaryLabel = latestSummary
    ? dayLabel(new Date(`${latestSummary.dayKey}T12:00:00-03:00`))
    : "";
  // First line of the recap is the title; the rest is the body.
  const summaryTrimmed = latestSummary?.body.trim() ?? "";
  const summaryBreak = summaryTrimmed.indexOf("\n");
  const summaryTitle =
    summaryBreak === -1 ? summaryTrimmed : summaryTrimmed.slice(0, summaryBreak).trim();
  const summaryBody =
    summaryBreak === -1 ? "" : summaryTrimmed.slice(summaryBreak + 1).trim();

  const sorted = players
    .map((p) => {
      let total = 0;
      let base = 0;
      let extra = 0;
      let exact = 0;
      let lastDay = 0;
      let played = 0;
      for (const pred of p.predictions) {
        if (pred.points === null) continue;
        const actual = {
          homeScore: pred.match.homeScore ?? 0,
          awayScore: pred.match.awayScore ?? 0,
        };
        total += pred.points;
        base += basePoints(pred, actual);
        extra += extraPoints(pred, actual);
        if (isExactScore(pred, actual)) exact += 1;
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
      return { username: p.username, total, base, extra, exact, lastDay, played };
    })
    // Tiebreaker hierarchy: total → exact scores → base points. Anyone still
    // even genuinely ties (shared rank); username only sets a stable order.
    .sort(
      (a, b) =>
        b.total - a.total ||
        b.exact - a.exact ||
        b.base - a.base ||
        a.username.localeCompare(b.username),
    );

  // Shared ranks: players even on total + exact + base get the same position
  // number, and the next rank skips accordingly (1, 2, 2, 4…).
  const rows: ((typeof sorted)[number] & { rank: number })[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const prev = rows[i - 1];
    const tied =
      prev &&
      prev.total === r.total &&
      prev.exact === r.exact &&
      prev.base === r.base;
    rows.push({ ...r, rank: tied ? prev.rank : i + 1 });
  }

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

      {latestSummary && (
        <section className="flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Resumen de la fecha · {summaryLabel}
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-accent">
            {summaryTitle}
          </h2>
          {summaryBody && (
            <p className="whitespace-pre-line text-sm text-fg">{summaryBody}</p>
          )}
          <p className="text-right text-xs italic text-muted">
            — Claudio, su cronista artificial de confianza 😏🔦
          </p>
        </section>
      )}

      <Leaderboard
        rows={rows}
        currentUsername={user.username}
        showLastDay={!!lastDayKey}
        lastDayLabel={lastDayLabel}
      />

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

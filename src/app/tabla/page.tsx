import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel } from "@/lib/dates";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isApproved(user) && !isAdmin(user)) redirect("/");

  // Most recent match-day (Argentina time) that has a finished match.
  const finishedMatches = await prisma.match.findMany({
    where: { status: "FINISHED" },
    select: { kickoffAt: true },
  });
  let lastDayKey: string | null = null;
  let lastDayLabel = "";
  for (const m of finishedMatches) {
    const key = dayKey(m.kickoffAt);
    if (lastDayKey === null || key > lastDayKey) {
      lastDayKey = key;
      lastDayLabel = dayLabel(m.kickoffAt);
    }
  }

  const players = await prisma.user.findMany({
    // Admins run the prode; they don't compete, so keep them off the table.
    where: { status: "APPROVED", role: { not: "ADMIN" } },
    select: {
      username: true,
      predictions: {
        select: {
          points: true,
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
        played += 1;
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

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="w-8 py-2 font-semibold">#</th>
            <th className="py-2 font-semibold">Jugador</th>
            {lastDayKey && (
              <th className="py-2 text-right font-semibold">
                Última fecha
                <span className="block text-xs font-normal normal-case text-muted/60">
                  {lastDayLabel}
                </span>
              </th>
            )}
            <th className="py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.username}
              className={`border-b border-line/60 ${
                r.username === user.username ? "bg-accent/5" : ""
              }`}
            >
              <td
                className={`py-3 font-bold tabular-nums ${
                  i === 0 ? "text-accent" : "text-muted"
                }`}
              >
                {i + 1}
              </td>
              <td className="py-3">
                <span className="font-semibold">{r.username}</span>
                <span className="ml-2 text-xs text-muted/60">
                  {r.played} jugados
                </span>
              </td>
              {lastDayKey && (
                <td className="py-3 text-right tabular-nums text-muted">
                  {r.lastDay > 0 ? `+${r.lastDay}` : "—"}
                </td>
              )}
              <td className="py-3 text-right font-bold tabular-nums text-accent">
                {r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

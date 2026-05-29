import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel, timeLabel } from "@/lib/dates";
import MatchSchedule from "@/components/MatchSchedule";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const canPlay = isApproved(user) || isAdmin(user);

  const now = Date.now();
  const matches = canPlay
    ? (
        await prisma.match.findMany({
          orderBy: { kickoffAt: "asc" },
          include: {
            predictions: {
              where: { userId: user.id },
              select: { homeScore: true, awayScore: true, points: true },
            },
          },
        })
      ).map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        dayKey: dayKey(m.kickoffAt),
        dayLabel: dayLabel(m.kickoffAt),
        timeLabel: timeLabel(m.kickoffAt),
        finished: m.status === "FINISHED",
        locked: m.status === "FINISHED" || m.kickoffAt.getTime() <= now,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        prediction: m.predictions[0] ?? null,
      }))
    : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="" className="h-8 w-auto" />
          <span>
            Prode <span className="text-accent">Linternas</span> 2026
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-muted">@{user.username}</span>
          {canPlay && (
            <>
              <Link href="/tabla" className="font-semibold text-fg hover:text-accent">
                Tabla
              </Link>
              <Link href="/reglas" className="font-semibold text-fg hover:text-accent">
                Reglas
              </Link>
            </>
          )}
          {isAdmin(user) && (
            <Link href="/admin" className="font-semibold text-fg hover:text-accent">
              Admin
            </Link>
          )}
          <form action={logoutAction}>
            <button className="font-semibold text-muted hover:text-danger">Salir</button>
          </form>
        </div>
      </header>

      {!canPlay ? (
        <section className="rounded-xl border border-accent/40 bg-accent/5 p-6 text-center">
          <h2 className="text-lg font-bold text-accent">Cuenta pendiente</h2>
          <p className="mt-2 text-sm text-muted">
            Tu cuenta está esperando la aprobación de un administrador. Volvé a entrar
            más tarde.
          </p>
        </section>
      ) : (
        <MatchSchedule matches={matches} />
      )}
    </main>
  );
}

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Prode Linternas 2026</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">@{user.username}</span>
          {canPlay && (
            <>
              <Link href="/tabla" className="font-medium text-blue-600 hover:underline">
                Tabla
              </Link>
              <Link href="/reglas" className="font-medium text-blue-600 hover:underline">
                Reglas
              </Link>
            </>
          )}
          {isAdmin(user) && (
            <Link href="/admin" className="font-medium text-blue-600 hover:underline">
              Admin
            </Link>
          )}
          <form action={logoutAction}>
            <button className="font-medium text-gray-600 hover:underline">Salir</button>
          </form>
        </div>
      </header>

      {!canPlay ? (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-800">Cuenta pendiente</h2>
          <p className="mt-2 text-sm text-amber-700">
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

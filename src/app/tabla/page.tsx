import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isApproved(user) && !isAdmin(user)) redirect("/");

  const players = await prisma.user.findMany({
    where: { OR: [{ status: "APPROVED" }, { role: "ADMIN" }] },
    select: {
      id: true,
      username: true,
      predictions: { select: { points: true } },
    },
  });

  const rows = players
    .map((p) => ({
      username: p.username,
      total: p.predictions.reduce((sum, pred) => sum + (pred.points ?? 0), 0),
      played: p.predictions.filter((pred) => pred.points !== null).length,
    }))
    .sort((a, b) => b.total - a.total || a.username.localeCompare(b.username));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tabla de posiciones</h1>
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver
        </Link>
      </header>

      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={r.username}
            className={`flex items-center justify-between rounded-md border px-4 py-3 ${
              r.username === user.username
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-6 text-right font-mono text-sm text-gray-400">
                {i + 1}
              </span>
              <span className="font-medium">@{r.username}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{r.played} jugados</span>
              <span className="font-semibold tabular-nums">{r.total} pts</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

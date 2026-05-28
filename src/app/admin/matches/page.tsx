import { prisma } from "@/lib/prisma";
import { dayKey, dayLabel, timeLabel } from "@/lib/dates";
import AddMatchForm from "./AddMatchForm";
import AdminMatchList from "./AdminMatchList";

export default async function AdminMatchesPage() {
  const rows = await prisma.match.findMany({ orderBy: { kickoffAt: "asc" } });
  const matches = rows.map((m) => ({
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    dayKey: dayKey(m.kickoffAt),
    dayLabel: dayLabel(m.kickoffAt),
    timeLabel: timeLabel(m.kickoffAt),
    finished: m.status === "FINISHED",
    homeScore: m.homeScore,
    awayScore: m.awayScore,
  }));

  return (
    <div className="flex flex-col gap-6">
      <AddMatchForm />
      <AdminMatchList matches={matches} />
    </div>
  );
}

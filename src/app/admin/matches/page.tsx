import { prisma } from "@/lib/prisma";
import { clearResult, deleteMatch, setResult } from "@/lib/actions/matches";
import LocalDateTime from "@/components/LocalDateTime";
import AddMatchForm from "./AddMatchForm";

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { kickoffAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AddMatchForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Partidos ({matches.length})</h2>
        {matches.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no cargaste partidos.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map((m) => {
              const finished = m.status === "FINISHED";
              return (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 rounded-md border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {m.homeTeam} vs {m.awayTeam}
                    </span>
                    <span className="text-sm text-gray-500">
                      <LocalDateTime iso={m.kickoffAt.toISOString()} />
                    </span>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <form action={setResult} className="flex items-end gap-2">
                      <input type="hidden" name="matchId" value={m.id} />
                      <label className="flex flex-col text-xs text-gray-500">
                        {m.homeTeam}
                        <input
                          name="homeScore"
                          type="number"
                          min={0}
                          defaultValue={m.homeScore ?? ""}
                          required
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
                        />
                      </label>
                      <span className="pb-1.5 text-gray-400">–</span>
                      <label className="flex flex-col text-xs text-gray-500">
                        {m.awayTeam}
                        <input
                          name="awayScore"
                          type="number"
                          min={0}
                          defaultValue={m.awayScore ?? ""}
                          required
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-base"
                        />
                      </label>
                      <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                        {finished ? "Actualizar" : "Cargar resultado"}
                      </button>
                    </form>

                    {finished && (
                      <form action={clearResult}>
                        <input type="hidden" name="matchId" value={m.id} />
                        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                          Reabrir
                        </button>
                      </form>
                    )}

                    <form action={deleteMatch} className="ml-auto">
                      <input type="hidden" name="matchId" value={m.id} />
                      <button className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                        Eliminar
                      </button>
                    </form>
                  </div>

                  {finished && (
                    <span className="text-xs font-medium text-green-700">
                      Finalizado: {m.homeScore} – {m.awayScore}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

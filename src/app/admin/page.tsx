import { prisma } from "@/lib/prisma";
import { approveUser, rejectUser } from "@/lib/actions/admin";

export default async function AdminPage() {
  const [pending, players] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { status: "APPROVED" },
      orderBy: { username: "asc" },
      select: { id: true, username: true, role: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Solicitudes pendientes
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
              >
                <span className="font-medium">@{u.username}</span>
                <div className="flex gap-2">
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                      Rechazar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Participantes ({players.length})</h2>
        <ul className="flex flex-col gap-2">
          {players.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-sm"
            >
              <span className="font-medium">@{u.username}</span>
              {u.role === "ADMIN" && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

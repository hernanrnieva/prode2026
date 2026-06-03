import { prisma } from "@/lib/prisma";
import { approveUser, rejectUser } from "@/lib/actions/admin";

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

function formatBid(cents: number): string {
  return arsFormatter.format(cents / 100);
}

export default async function AdminPage() {
  const [pending, players] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        entryBidCents: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { status: "APPROVED" },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        entryBidCents: true,
        role: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">
          Solicitudes pendientes
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-sm font-bold text-accent-fg">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">No hay solicitudes pendientes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3"
              >
                <span className="flex flex-col">
                  <span className="font-semibold">{u.username}</span>
                  {u.name && (
                    <span className="text-xs text-muted">{u.name}</span>
                  )}
                  {u.entryBidCents != null && (
                    <span className="text-xs text-muted">
                      Inscripción esperada: {formatBid(u.entryBidCents)}
                    </span>
                  )}
                </span>
                <div className="flex gap-2">
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-fg hover:brightness-95">
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="rounded-md border border-danger/50 px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger/10">
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
        <h2 className="text-lg font-bold">Participantes ({players.length})</h2>
        <ul className="flex flex-col gap-2">
          {players.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-sm"
            >
              <span className="flex flex-col">
                <span className="font-semibold">{u.username}</span>
                {u.name && <span className="text-xs text-muted">{u.name}</span>}
                {u.entryBidCents != null && (
                  <span className="text-xs text-muted">
                    Inscripción esperada: {formatBid(u.entryBidCents)}
                  </span>
                )}
              </span>
              {u.role === "ADMIN" && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
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

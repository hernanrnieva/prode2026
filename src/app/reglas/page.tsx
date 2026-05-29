import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";
import { BASE_POINTS, EXTRA_CAP } from "@/lib/scoring";

const examples = [
  { pred: "3 – 1", real: "4 – 2", base: BASE_POINTS, extra: 3, total: BASE_POINTS + 3 },
  { pred: "4 – 1", real: "0 – 1", base: 0, extra: 1, total: 1 },
  { pred: "3 – 3", real: "1 – 1", base: BASE_POINTS, extra: 1, total: BASE_POINTS + 1 },
];

export default async function RulesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isApproved(user) && !isAdmin(user)) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Cómo se <span className="text-accent">puntúa</span>
        </h1>
        <Link href="/" className="text-sm font-semibold text-fg hover:text-accent">
          ← Volver
        </Link>
      </header>

      <p className="text-muted">
        En cada partido sumás <strong className="text-fg">puntos base</strong> más{" "}
        <strong className="text-fg">puntos extra</strong>. El máximo por partido es{" "}
        <span className="font-bold text-accent">{BASE_POINTS + EXTRA_CAP}</span> y el
        mínimo es 0.
      </p>

      <section className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4">
        <h2 className="font-bold text-accent">Puntos base — {BASE_POINTS} o 0</h2>
        <p className="text-sm text-muted">
          Ganás los {BASE_POINTS} puntos base si acertás el resultado: que gane el
          local, que gane el visitante, o que sea empate. Si te equivocás de
          resultado, son 0.
        </p>
      </section>

      <section className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4">
        <h2 className="font-bold text-accent">Puntos extra — de {EXTRA_CAP} a 0</h2>
        <p className="text-sm text-muted">
          Arrancás con {EXTRA_CAP} puntos y se descuenta 1 por cada gol de
          diferencia con el marcador real, sumando ambos equipos. Nunca bajan de 0.
        </p>
        <p className="text-sm text-muted">
          Los puntos extra son independientes de los base: podés sumar extra aunque
          falles el resultado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-bold">Ejemplos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-4 font-semibold">Tu pronóstico</th>
                <th className="py-2 pr-4 font-semibold">Resultado</th>
                <th className="py-2 pr-4 font-semibold">Base</th>
                <th className="py-2 pr-4 font-semibold">Extra</th>
                <th className="py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.pred + e.real} className="border-b border-line/60">
                  <td className="py-2 pr-4 tabular-nums">{e.pred}</td>
                  <td className="py-2 pr-4 tabular-nums">{e.real}</td>
                  <td className="py-2 pr-4 tabular-nums">{e.base}</td>
                  <td className="py-2 pr-4 tabular-nums">{e.extra}</td>
                  <td className="py-2 font-bold tabular-nums text-accent">{e.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

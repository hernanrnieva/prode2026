import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Admin<span className="text-accent">istración</span>
        </h1>
        <Link href="/" className="text-sm font-semibold text-fg hover:text-accent">
          ← Volver
        </Link>
      </header>
      <nav className="flex gap-5 border-b border-line pb-3 text-sm font-semibold">
        <Link href="/admin" className="text-muted hover:text-accent">
          Usuarios
        </Link>
        <Link href="/admin/matches" className="text-muted hover:text-accent">
          Partidos
        </Link>
        <Link href="/admin/predictions" className="text-muted hover:text-accent">
          Pronósticos
        </Link>
      </nav>
      {children}
    </div>
  );
}

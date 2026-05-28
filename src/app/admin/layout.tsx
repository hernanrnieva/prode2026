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
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Administración</h1>
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver
        </Link>
      </header>
      <nav className="flex gap-4 border-b border-gray-200 pb-2 text-sm font-medium">
        <Link href="/admin" className="text-gray-700 hover:text-blue-600">
          Usuarios
        </Link>
        <Link href="/admin/matches" className="text-gray-700 hover:text-blue-600">
          Partidos
        </Link>
      </nav>
      {children}
    </div>
  );
}

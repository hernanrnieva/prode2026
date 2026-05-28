import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Prode Linternas 2026</h1>
        <p className="text-sm text-gray-500">Iniciá sesión para jugar</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-500">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Registrate
        </Link>
      </p>
    </main>
  );
}

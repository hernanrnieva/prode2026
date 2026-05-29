import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="" className="h-20 w-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wordmark.svg" alt="Prode" className="mt-4 h-8 w-auto" />
        <p className="mt-1 text-lg font-bold tracking-tight text-accent">
          Linternas 2026
        </p>
        <p className="mt-2 text-sm text-muted">Iniciá sesión para jugar</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Registrate
        </Link>
      </p>
    </main>
  );
}

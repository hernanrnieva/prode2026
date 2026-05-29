import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="" className="h-16 w-auto" />
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Crear <span className="text-accent">cuenta</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Un administrador deberá aprobar tu cuenta antes de jugar.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </main>
  );
}

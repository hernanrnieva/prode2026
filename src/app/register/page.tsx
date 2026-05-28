import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="text-sm text-gray-500">
          Un administrador deberá aprobar tu cuenta antes de jugar.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </main>
  );
}

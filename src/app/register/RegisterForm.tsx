"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Usuario
        <input
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal outline-none focus:border-blue-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal outline-none focus:border-blue-500"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}

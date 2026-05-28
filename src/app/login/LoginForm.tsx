"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Usuario
        <input
          name="username"
          autoComplete="username"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal outline-none focus:border-blue-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-base font-normal outline-none focus:border-blue-500"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

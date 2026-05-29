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
          className="rounded-md border border-line bg-card px-3 py-2 text-base font-normal text-fg outline-none focus:border-accent"
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
          className="rounded-md border border-line bg-card px-3 py-2 text-base font-normal text-fg outline-none focus:border-accent"
        />
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 font-bold text-accent-fg hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}

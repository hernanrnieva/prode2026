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
        <span className="text-xs font-normal text-muted">
          Este es el nombre que verán los demás en la tabla.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Nombre
        <input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          className="rounded-md border border-line bg-card px-3 py-2 text-base font-normal text-fg outline-none focus:border-accent"
        />
        <span className="text-xs font-normal text-muted">
          Tu nombre real. Solo lo ve el administrador.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        ¿Cuánto esperás pagar de inscripción?
        <div className="flex items-center rounded-md border border-line bg-card focus-within:border-accent">
          <span className="pl-3 text-muted">$</span>
          <input
            name="entryBid"
            type="number"
            min={0}
            max={25000}
            step="0.01"
            inputMode="decimal"
            required
            className="w-full rounded-md bg-transparent px-2 py-2 text-base font-normal text-fg outline-none"
          />
          <span className="pr-3 text-xs text-muted">ARS</span>
        </div>
        <span className="text-xs font-normal text-muted">
          Entre $0 y $25.000. Solo lo ve el administrador.
        </span>
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

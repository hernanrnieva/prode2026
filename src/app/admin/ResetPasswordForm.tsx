"use client";

import { useActionState, useState } from "react";
import { setUserPassword, type AdminActionState } from "@/lib/actions/admin";

const initialState: AdminActionState = {};

export default function ResetPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(setUserPassword, initialState);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-muted hover:text-accent"
      >
        Cambiar contraseña
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <input
          name="password"
          type="text"
          placeholder="Nueva contraseña"
          minLength={6}
          required
          autoComplete="off"
          className="w-40 rounded-md border border-line bg-background px-2 py-1 text-sm text-fg outline-none placeholder:text-muted/50 focus:border-accent"
        />
        <button
          disabled={pending}
          className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-fg"
        >
          Cancelar
        </button>
      </div>
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
      {state.ok && !pending && (
        <span className="text-xs font-semibold text-accent">
          Contraseña actualizada ✓
        </span>
      )}
    </form>
  );
}

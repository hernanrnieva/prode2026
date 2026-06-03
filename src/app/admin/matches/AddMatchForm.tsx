"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createMatch, type MatchState } from "@/lib/actions/matches";

const initialState: MatchState = {};

// Parse "DD/MM/AAAA" + "HH:MM" into a Date in the admin's local timezone.
// Returns null if the strings are incomplete or not a real calendar date.
function parseKickoff(dateStr: string, timeStr: string): Date | null {
  const dm = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const tm = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!dm || !tm) return null;
  const day = +dm[1];
  const month = +dm[2];
  const year = +dm[3];
  const hour = +tm[1];
  const min = +tm[2];
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || min > 59) {
    return null;
  }
  const d = new Date(year, month - 1, day, hour, min);
  // Reject rollover dates like 31/02 that JS would silently shift.
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
}

export default function AddMatchForm() {
  const [state, formAction, pending] = useActionState(createMatch, initialState);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // After a successful add, clear only the team names and keep the kickoff
  // date/time — fixtures on the same day are usually loaded back to back.
  useEffect(() => {
    if (state.ok && !pending) {
      const form = formRef.current;
      if (form) {
        const home = form.elements.namedItem("homeTeam") as HTMLInputElement | null;
        const away = form.elements.namedItem("awayTeam") as HTMLInputElement | null;
        if (home) home.value = "";
        if (away) away.value = "";
        home?.focus();
      }
    }
  }, [state, pending]);

  const kickoff = parseKickoff(dateStr, timeStr);
  const kickoffIso = kickoff ? kickoff.toISOString() : "";
  const preview = kickoff
    ? kickoff.toLocaleString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4"
    >
      <h3 className="font-bold text-accent">Agregar partido</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="homeTeam"
          placeholder="Local"
          required
          className="flex-1 rounded-md border border-line bg-background px-3 py-2 text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <input
          name="awayTeam"
          placeholder="Visitante"
          required
          className="flex-1 rounded-md border border-line bg-background px-3 py-2 text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Fecha
          <input
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="rounded-md border border-line bg-background px-3 py-2 text-base text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted sm:w-32">
          Hora
          <input
            inputMode="numeric"
            placeholder="HH:MM"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="rounded-md border border-line bg-background px-3 py-2 text-base text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </label>
      </div>
      <input type="hidden" name="kickoffAt" value={kickoffIso} />
      {preview ? (
        <p className="text-xs text-muted">
          Se guardará: <span className="font-semibold text-fg">{preview}</span>
        </p>
      ) : (
        (dateStr || timeStr) && (
          <p className="text-xs text-danger">
            Completá fecha (DD/MM/AAAA) y hora (HH:MM) válidas.
          </p>
        )
      )}
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || !kickoff}
        className="self-start rounded-md bg-accent px-4 py-2 font-bold text-accent-fg hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar partido"}
      </button>
    </form>
  );
}

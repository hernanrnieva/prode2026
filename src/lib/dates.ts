// All players are in Argentina, so dates/times are formatted in Argentina time
// with Spanish (es-AR) conventions: 24-hour clock and DD/MM/YYYY. Centralising
// this here also lets the server group matches by "day" deterministically
// (no per-browser timezone, so no hydration mismatch).
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const LOCALE = "es-AR";

// Stable YYYY-MM-DD key in Argentina time — safe to group on and sort lexically.
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// e.g. "lunes, 15 de junio"
export function dayLabel(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

// e.g. "18:00"
export function timeLabel(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

// e.g. "15/06/2026 18:00"
export function dateTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

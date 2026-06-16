"use client";

import { Fragment, useState } from "react";

export type LeaderboardRow = {
  rank: number;
  username: string;
  total: number;
  lastDay: number;
  played: number;
  exact: number;
  base: number;
  extra: number;
};

export default function Leaderboard({
  rows,
  currentUsername,
  showLastDay,
  lastDayLabel,
}: {
  rows: LeaderboardRow[];
  currentUsername: string;
  showLastDay: boolean;
  lastDayLabel: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const colSpan = showLastDay ? 4 : 3;

  return (
    <table className="w-full border-separate border-spacing-y-1 text-sm">
      <thead>
        <tr className="text-left text-muted">
          <th className="w-8 py-2 pl-4 font-semibold">#</th>
          <th className="py-2 font-semibold">Jugador</th>
          {showLastDay && (
            <th className="py-2 pr-2 text-right font-semibold">
              Última fecha
              <span className="block text-xs font-normal normal-case text-muted/60">
                {lastDayLabel}
              </span>
            </th>
          )}
          <th className="py-2 pr-4 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const isMe = r.username === currentUsername;
          const hi = isMe ? "bg-accent/10" : "";
          const isOpen = open === r.username;
          // Podium gets larger type, tapering 1 → 2 → 3; everyone else equal.
          const size =
            r.rank === 1
              ? "text-xl"
              : r.rank === 2
                ? "text-lg"
                : r.rank === 3
                  ? "text-base"
                  : "text-sm";
          return (
            <Fragment key={r.username}>
              <tr
                className={`${size} cursor-pointer`}
                onClick={() => setOpen(isOpen ? null : r.username)}
              >
                <td
                  className={`rounded-l-lg py-3 pl-4 pr-2 font-bold tabular-nums ${
                    r.rank === 1 ? "text-accent" : "text-muted"
                  } ${hi}`}
                >
                  {r.rank}
                </td>
                <td className={`py-3 ${hi}`}>
                  <span className="font-semibold">{r.username}</span>
                  <span className="ml-2 text-xs text-muted/60">
                    {r.played} jugados
                  </span>
                </td>
                {showLastDay && (
                  <td
                    className={`py-3 pr-2 text-right tabular-nums text-muted ${hi}`}
                  >
                    {r.lastDay > 0 ? `+${r.lastDay}` : "—"}
                  </td>
                )}
                <td
                  className={`rounded-r-lg py-3 pl-2 pr-4 text-right font-bold tabular-nums text-accent ${hi}`}
                >
                  {r.total}
                </td>
              </tr>
              {isOpen && (
                <tr>
                  <td colSpan={colSpan} className="px-2 pb-1">
                    <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 rounded-lg bg-card px-3 py-2 text-xs text-muted">
                      <span>
                        <span className="font-bold text-accent">{r.exact}</span>{" "}
                        exactos
                      </span>
                      <span>
                        <span className="font-bold text-fg">{r.base}</span> base
                      </span>
                      <span>
                        <span className="font-bold text-fg">{r.extra}</span> extra
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

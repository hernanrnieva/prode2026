"use client";

import { useRouter } from "next/navigation";

export default function DateSelect({
  days,
  selected,
}: {
  days: { key: string; label: string; count: number }[];
  selected: string;
}) {
  const router = useRouter();
  return (
    <select
      value={selected}
      onChange={(e) =>
        router.push(`/admin/predictions?date=${e.target.value}`)
      }
      className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm font-medium text-fg outline-none focus:border-accent [color-scheme:dark]"
    >
      {days.map((d) => (
        <option key={d.key} value={d.key}>
          {d.label} · {d.count} {d.count === 1 ? "partido" : "partidos"}
        </option>
      ))}
    </select>
  );
}

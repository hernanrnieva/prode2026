"use client";

import { useEffect, useState } from "react";

export default function LocalDateTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(
      new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso]);

  // Fallback to a stable ISO date before hydration to avoid layout shift.
  return <time dateTime={iso}>{text || iso.slice(0, 16).replace("T", " ")}</time>;
}

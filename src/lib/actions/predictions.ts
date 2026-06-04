"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin, isApproved } from "@/lib/auth";

export type PredictionState = { error?: string; ok?: boolean };

export async function savePrediction(
  _prev: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado." };
  if (!isApproved(user) && !isAdmin(user)) {
    return { error: "Tu cuenta todavía no está aprobada." };
  }

  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    return { error: "Ingresá un resultado válido." };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { kickoffAt: true },
  });
  if (!match) return { error: "El partido no existe." };

  // Authoritative lock: never trust the client's view of whether the match started.
  if (match.kickoffAt <= new Date()) {
    return { error: "El partido ya empezó, no se puede modificar." };
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: user.id, matchId } },
    create: { userId: user.id, matchId, homeScore, awayScore, auto: false },
    update: { homeScore, awayScore, auto: false },
  });
  revalidatePath("/");
  return { ok: true };
}

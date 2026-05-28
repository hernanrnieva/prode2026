"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export type MatchState = { error?: string };

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("No autorizado.");
}

export async function createMatch(
  _prev: MatchState,
  formData: FormData,
): Promise<MatchState> {
  await assertAdmin();

  const homeTeam = String(formData.get("homeTeam") ?? "").trim();
  const awayTeam = String(formData.get("awayTeam") ?? "").trim();
  const kickoffRaw = String(formData.get("kickoffAt") ?? "");
  const kickoffAt = new Date(kickoffRaw);

  if (!homeTeam || !awayTeam) {
    return { error: "Ingresá ambos equipos." };
  }
  if (!kickoffRaw || Number.isNaN(kickoffAt.getTime())) {
    return { error: "Ingresá una fecha y hora válidas." };
  }

  await prisma.match.create({ data: { homeTeam, awayTeam, kickoffAt } });
  revalidatePath("/admin/matches");
  return {};
}

export async function setResult(formData: FormData) {
  await assertAdmin();

  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    throw new Error("Resultado inválido.");
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "FINISHED" },
  });
  revalidatePath("/admin/matches");
}

export async function clearResult(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: null, awayScore: null, status: "SCHEDULED" },
  });
  revalidatePath("/admin/matches");
}

export async function deleteMatch(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath("/admin/matches");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { computePoints } from "@/lib/scoring";

export type MatchState = { error?: string; ok?: boolean };

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
  revalidatePath("/");
  return { ok: true };
}

export async function setResult(formData: FormData) {
  await assertAdmin();

  const matchId = String(formData.get("matchId"));
  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    throw new Error("Resultado inválido.");
  }

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "FINISHED" },
    select: { kickoffAt: true },
  });

  // Players who never predicted are defaulted to 0-0. Only those who existed
  // before kickoff get a default — nobody is penalized for a match played
  // before they joined.
  const eligible = await prisma.user.findMany({
    where: {
      status: "APPROVED",
      role: { not: "ADMIN" },
      createdAt: { lte: match.kickoffAt },
    },
    select: { id: true },
  });
  const existing = await prisma.prediction.findMany({
    where: { matchId },
    select: { userId: true },
  });
  const predicted = new Set(existing.map((p) => p.userId));
  const missing = eligible.filter((u) => !predicted.has(u.id));
  if (missing.length > 0) {
    await prisma.prediction.createMany({
      data: missing.map((u) => ({
        userId: u.id,
        matchId,
        homeScore: 0,
        awayScore: 0,
        auto: true,
      })),
      skipDuplicates: true,
    });
  }

  // Recompute every player's points for this match against the final score.
  const predictions = await prisma.prediction.findMany({
    where: { matchId },
    select: { id: true, homeScore: true, awayScore: true },
  });
  await prisma.$transaction(
    predictions.map((p) =>
      prisma.prediction.update({
        where: { id: p.id },
        data: { points: computePoints(p, { homeScore, awayScore }) },
      }),
    ),
  );

  revalidatePath("/admin/matches");
  revalidatePath("/admin/predictions");
  revalidatePath("/");
  revalidatePath("/tabla");
}

export async function clearResult(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: null, awayScore: null, status: "SCHEDULED" },
  });
  // Reopening a match undoes the 0-0 defaults entirely and invalidates the
  // points awarded to real predictions.
  await prisma.prediction.deleteMany({ where: { matchId, auto: true } });
  await prisma.prediction.updateMany({
    where: { matchId },
    data: { points: null },
  });
  revalidatePath("/admin/matches");
  revalidatePath("/admin/predictions");
  revalidatePath("/");
  revalidatePath("/tabla");
}

export async function deleteMatch(formData: FormData) {
  await assertAdmin();
  const matchId = String(formData.get("matchId"));
  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath("/admin/matches");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, isAdmin } from "@/lib/auth";

export type AdminActionState = { error?: string; ok?: boolean };

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) throw new Error("No autorizado.");
}

export async function approveUser(formData: FormData) {
  await assertAdmin();
  const userId = String(formData.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin");
}

export async function rejectUser(formData: FormData) {
  await assertAdmin();
  const userId = String(formData.get("userId"));
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function setUserPassword(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await assertAdmin();
  const userId = String(formData.get("userId"));
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    return { error: "Mínimo 6 caracteres." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) return { error: "El usuario no existe." };

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
  revalidatePath("/admin");
  return { ok: true };
}

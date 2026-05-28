"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

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

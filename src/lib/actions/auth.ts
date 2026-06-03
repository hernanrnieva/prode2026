"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string };

function normalizeUsername(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toLowerCase();
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername(formData.get("username"));
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Expected entry payment in ARS pesos (0–25000), stored as centavos.
  const entryBidRaw = String(formData.get("entryBid") ?? "").trim();
  const entryBidPesos = Number(entryBidRaw);

  if (username.length < 3 || username.length > 30) {
    return { error: "El usuario debe tener entre 3 y 30 caracteres." };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "El usuario solo puede contener letras, números y guion bajo." };
  }
  if (name.length < 2 || name.length > 60) {
    return { error: "Ingresá tu nombre real (entre 2 y 60 caracteres)." };
  }
  if (
    entryBidRaw === "" ||
    !Number.isFinite(entryBidPesos) ||
    entryBidPesos < 0 ||
    entryBidPesos > 25000
  ) {
    return { error: "Ingresá un monto entre $0 y $25.000." };
  }
  const entryBidCents = Math.round(entryBidPesos * 100);
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "Ese usuario ya está en uso." };
  }

  const user = await prisma.user.create({
    data: {
      username,
      name,
      entryBidCents,
      passwordHash: await hashPassword(password),
    },
  });
  await createSession(user.id);

  redirect("/");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = normalizeUsername(formData.get("username"));
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

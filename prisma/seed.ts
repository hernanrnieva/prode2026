import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = (process.env.ADMIN_USERNAME ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!username || !password) {
    throw new Error(
      "Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before running the seed.",
    );
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.user.upsert({
    where: { username },
    update: { role: "ADMIN", status: "APPROVED", passwordHash },
    create: {
      username,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log(`Admin ready: @${admin.username}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export async function deletePlayers(emails: string[]): Promise<void> {
  const uniqueEmails = [...new Set(emails)];
  if (uniqueEmails.length === 0) {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("[e2e] DATABASE_URL not found; skipping player cleanup.");
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const { count } = await prisma.player.deleteMany({
      where: { email: { in: uniqueEmails } },
    });
    console.log(`[e2e] Cleaned up ${count} e2e player(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

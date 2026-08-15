import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { config } from "dotenv";

config({ path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Development-only seed. The password below is used solely for local development
// logins and is never a production credential.
const SEED_PASSWORD = "CyberGuard-Dev-Pass!";

interface SeedPlayer {
  name: string;
  email: string;
  points: number;
  createdAt: Date;
}

const players: SeedPlayer[] = [
  {
    name: "Ana Ribeiro",
    email: "ana.ribeiro@example.com",
    points: 150,
    createdAt: new Date("2026-08-01T10:00:00.000Z"),
  },
  {
    name: "Lucas Ferreira",
    email: "lucas.ferreira@example.com",
    points: 120,
    createdAt: new Date("2026-08-01T11:00:00.000Z"),
  },
  {
    name: "Beatriz Souza",
    email: "beatriz.souza@example.com",
    points: 100,
    createdAt: new Date("2026-08-02T09:00:00.000Z"),
  },
  {
    name: "Gabriel Almeida",
    email: "gabriel.almeida@example.com",
    points: 90,
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
  },
  {
    name: "Juliana Costa",
    email: "juliana.costa@example.com",
    points: 75,
    createdAt: new Date("2026-08-03T08:00:00.000Z"),
  },
  {
    name: "Rafael Oliveira",
    email: "rafael.oliveira@example.com",
    points: 75,
    createdAt: new Date("2026-08-03T09:00:00.000Z"),
  },
  {
    name: "Mariana Santos",
    email: "mariana.santos@example.com",
    points: 60,
    createdAt: new Date("2026-08-04T10:00:00.000Z"),
  },
  {
    name: "Thiago Lima",
    email: "thiago.lima@example.com",
    points: 50,
    createdAt: new Date("2026-08-05T10:00:00.000Z"),
  },
  {
    name: "Camila Pereira",
    email: "camila.pereira@example.com",
    points: 40,
    createdAt: new Date("2026-08-06T10:00:00.000Z"),
  },
  {
    name: "Felipe Martins",
    email: "felipe.martins@example.com",
    points: 25,
    createdAt: new Date("2026-08-07T10:00:00.000Z"),
  },
  {
    name: "Larissa Barbosa",
    email: "larissa.barbosa@example.com",
    points: 10,
    createdAt: new Date("2026-08-08T10:00:00.000Z"),
  },
  {
    name: "Pedro Nogueira",
    email: "pedro.nogueira@example.com",
    points: 0,
    createdAt: new Date("2026-08-09T10:00:00.000Z"),
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed the production database");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

  const existing = await prisma.player.findMany({
    where: { email: { in: players.map((player) => player.email) } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((player) => player.email));

  const passwordHash = await hash(SEED_PASSWORD);

  let created = 0;
  let updated = 0;

  for (const player of players) {
    const wasCreated = !existingEmails.has(player.email);
    await prisma.player.upsert({
      where: { email: player.email },
      update: {
        name: player.name,
        points: player.points,
        passwordHash,
        createdAt: player.createdAt,
      },
      create: {
        name: player.name,
        email: player.email,
        points: player.points,
        passwordHash,
        createdAt: player.createdAt,
      },
    });

    if (wasCreated) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Seed finished: ${created} players created, ${updated} players updated.`);

  await prisma.$disconnect();
}

void main();

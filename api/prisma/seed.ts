import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { config } from "dotenv";

import { MISSIONS, QUESTIONS_BY_DIFFICULTY } from "./seed-data.js";

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

  await seedMissions(prisma);
  const { questions, answers } = await seedQuestions(prisma);
  console.log(
    `Seed finished: ${questions} questions created, ${answers} answers created.`,
  );

  await prisma.$disconnect();
}

async function seedMissions(prisma: PrismaClient): Promise<void> {
  let created = 0;

  for (const mission of MISSIONS) {
    const existing = await prisma.mission.findUnique({
      where: { id: mission.id },
      select: { id: true },
    });
    if (existing) {
      continue;
    }

    await prisma.mission.create({ data: mission });
    created += 1;
  }

  console.log(`Seed missions: ${created} missions created.`);
}

async function seedQuestions(
  prisma: PrismaClient,
): Promise<{ questions: number; answers: number }> {
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});

  let questions = 0;
  let answers = 0;

  for (const [difficulty, seedQuestions] of Object.entries(QUESTIONS_BY_DIFFICULTY)) {
    const mission = await prisma.mission.findFirst({
      where: { difficulty: difficulty as (typeof MISSIONS)[number]["difficulty"] },
      orderBy: { createdAt: "asc" },
    });
    if (!mission) {
      throw new Error(`Cannot seed questions: no ${difficulty} mission found`);
    }

    for (const question of seedQuestions) {
      await prisma.question.create({
        data: {
          id: question.id,
          missionId: mission.id,
          prompt: question.prompt,
          answers: {
            create: question.answers.map((answer) => ({
              id: answer.id,
              text: answer.text,
              isCorrect: answer.isCorrect,
            })),
          },
        },
      });
      questions += 1;
      answers += question.answers.length;
    }
  }

  return { questions, answers };
}

void main();

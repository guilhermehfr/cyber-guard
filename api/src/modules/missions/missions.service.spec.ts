import { ConflictException, NotFoundException } from "@nestjs/common";
import { type Attempt, type Mission, Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "@/infrastructure/database/prisma.service.js";

import { MissionsService } from "./missions.service.js";

const sampleMission: Mission = {
  id: "clmission000000000001",
  title: "Phishing Basics",
  description: "Identify phishing emails",
  difficulty: "EASY",
  points: 50,
  createdAt: new Date("2026-08-14T12:00:00.000Z"),
  updatedAt: new Date("2026-08-14T12:00:00.000Z"),
};

const sampleCompletion: Attempt = {
  id: "clattempt000000000001",
  playerId: "player-1",
  missionId: "clmission000000000001",
  score: 0,
  completedAt: new Date("2026-08-14T12:05:00.000Z"),
};

const updatedPlayer = {
  id: "player-1",
  name: "Ada",
  email: "ada@example.com",
  passwordHash: null,
  points: 150,
  createdAt: new Date("2026-08-14T12:00:00.000Z"),
  updatedAt: new Date("2026-08-14T12:05:00.000Z"),
};

function createMocks() {
  const missionModel = { findMany: vi.fn(), findUnique: vi.fn() };
  const attemptModel = { findUnique: vi.fn(), create: vi.fn() };
  const playerModel = { update: vi.fn() };

  const prisma = {
    mission: missionModel,
    attempt: attemptModel,
    player: playerModel,
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ mission: missionModel, attempt: attemptModel, player: playerModel }),
    ),
  } as unknown as PrismaService;

  return { prisma, missionModel, attemptModel, playerModel };
}

function createService(mocks: ReturnType<typeof createMocks>): MissionsService {
  return new MissionsService(mocks.prisma);
}

describe("MissionsService", () => {
  describe("listMissions", () => {
    it("returns the available missions", async () => {
      const mocks = createMocks();
      mocks.missionModel.findMany.mockResolvedValue([sampleMission]);
      const service = createService(mocks);

      const result = await service.listMissions();

      expect(mocks.missionModel.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([
        {
          id: sampleMission.id,
          title: sampleMission.title,
          description: sampleMission.description,
          difficulty: sampleMission.difficulty,
          points: sampleMission.points,
          createdAt: sampleMission.createdAt.toISOString(),
          updatedAt: sampleMission.updatedAt.toISOString(),
        },
      ]);
    });
  });

  describe("completeMission", () => {
    it("throws NotFoundException when the mission does not exist", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(service.completeMission("player-1", "missing-mission")).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mocks.attemptModel.create).not.toHaveBeenCalled();
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
    });

    it("completes the mission and awards the mission points", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(sampleMission);
      mocks.attemptModel.findUnique.mockResolvedValue(null);
      mocks.attemptModel.create.mockResolvedValue(sampleCompletion);
      mocks.playerModel.update.mockResolvedValue(updatedPlayer);
      const service = createService(mocks);

      const result = await service.completeMission("player-1", sampleMission.id);

      expect(mocks.attemptModel.create).toHaveBeenCalledWith({
        data: { playerId: "player-1", missionId: sampleMission.id },
      });
      expect(mocks.playerModel.update).toHaveBeenCalledWith({
        where: { id: "player-1" },
        data: { points: { increment: sampleMission.points } },
      });
      expect(result).toEqual({
        completion: {
          id: sampleCompletion.id,
          missionId: sampleCompletion.missionId,
          completedAt: sampleCompletion.completedAt.toISOString(),
        },
        pointsAwarded: sampleMission.points,
        playerPoints: 150,
      });
    });

    it("rejects completing a mission that was already completed", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(sampleMission);
      mocks.attemptModel.findUnique.mockResolvedValue(sampleCompletion);
      const service = createService(mocks);

      await expect(service.completeMission("player-1", sampleMission.id)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(mocks.attemptModel.create).not.toHaveBeenCalled();
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
    });

    it("rejects a duplicate completion under a concurrent race", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(sampleMission);
      mocks.attemptModel.findUnique.mockResolvedValue(null);
      const uniqueViolation = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.9.1",
      });
      mocks.attemptModel.create.mockRejectedValue(uniqueViolation);
      const service = createService(mocks);

      await expect(service.completeMission("player-1", sampleMission.id)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
    });
  });
});

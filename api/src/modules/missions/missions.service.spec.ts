import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { type Attempt, type Mission, Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "@/infrastructure/database/prisma.service.js";
import type { RealtimeGateway } from "@/modules/realtime/realtime.gateway.js";

import type { GameSession, GameSessionService } from "./game-session.service.js";
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

const sampleQuestions = [
  {
    id: "clquestion000000000001",
    missionId: sampleMission.id,
    prompt: "What is phishing?",
    createdAt: new Date("2026-08-14T12:01:00.000Z"),
    updatedAt: new Date("2026-08-14T12:01:00.000Z"),
    answers: [
      {
        id: "clanswer000000000001",
        questionId: "clquestion000000000001",
        text: "Social engineering",
        isCorrect: true,
      },
      {
        id: "clanswer000000000002",
        questionId: "clquestion000000000001",
        text: "A firewall",
        isCorrect: false,
      },
    ],
  },
  {
    id: "clquestion000000000002",
    missionId: sampleMission.id,
    prompt: "Best password practice?",
    createdAt: new Date("2026-08-14T12:02:00.000Z"),
    updatedAt: new Date("2026-08-14T12:02:00.000Z"),
    answers: [
      {
        id: "clanswer000000000003",
        questionId: "clquestion000000000002",
        text: "Long unique passwords",
        isCorrect: true,
      },
      {
        id: "clanswer000000000004",
        questionId: "clquestion000000000002",
        text: "Reuse one password",
        isCorrect: false,
      },
    ],
  },
];

const sampleCompletion: Attempt = {
  id: "clattempt000000000001",
  playerId: "player-1",
  missionId: "clmission000000000001",
  score: 50,
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

function createSampleSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    sessionId: "session-1",
    playerId: "player-1",
    missionId: sampleMission.id,
    questions: sampleQuestions.map((question) => ({
      questionId: question.id,
      answerIds: question.answers.map((answer) => answer.id),
      correctAnswerIds: question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.id),
    })),
    answers: [],
    ...overrides,
  };
}

function createMocks() {
  const missionModel = { findMany: vi.fn(), findUnique: vi.fn() };
  const attemptModel = { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() };
  const playerModel = { update: vi.fn() };

  const prisma = {
    mission: missionModel,
    attempt: attemptModel,
    player: playerModel,
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ mission: missionModel, attempt: attemptModel, player: playerModel }),
    ),
  } as unknown as PrismaService;

  const realtime = {
    emitRankingUpdated: vi.fn(),
    emitPlayerScoreUpdated: vi.fn(),
  } as unknown as RealtimeGateway;

  const gameSessions = {
    create: vi.fn(),
    get: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  } as unknown as GameSessionService;

  return { prisma, missionModel, attemptModel, playerModel, realtime, gameSessions };
}

function createService(mocks: ReturnType<typeof createMocks>): MissionsService {
  return new MissionsService(mocks.prisma, mocks.realtime, mocks.gameSessions);
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

  describe("getMissionQuestions", () => {
    it("returns the mission questions without exposing correctness", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue({
        id: sampleMission.id,
        questions: sampleQuestions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          answers: question.answers.map(({ id, text }) => ({ id, text })),
        })),
      });
      const service = createService(mocks);

      const result = await service.getMissionQuestions(sampleMission.id);

      expect(mocks.missionModel.findUnique).toHaveBeenCalledWith({
        where: { id: sampleMission.id },
        select: {
          id: true,
          questions: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              prompt: true,
              answers: {
                orderBy: { id: "asc" },
                select: { id: true, text: true },
              },
            },
          },
        },
      });
      expect(JSON.stringify(result)).not.toContain("isCorrect");
    });

    it("throws NotFoundException when the mission does not exist", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(service.getMissionQuestions("missing-mission")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("startMission", () => {
    it("returns a session id and the public questions without exposing correctness", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue({
        id: sampleMission.id,
        questions: sampleQuestions,
      });
      mocks.gameSessions.create.mockResolvedValue("session-1");
      const service = createService(mocks);

      const result = await service.startMission("player-1", sampleMission.id);

      expect(mocks.gameSessions.create).toHaveBeenCalledWith({
        playerId: "player-1",
        missionId: sampleMission.id,
        questions: [
          {
            questionId: "clquestion000000000001",
            answerIds: ["clanswer000000000001", "clanswer000000000002"],
            correctAnswerIds: ["clanswer000000000001"],
          },
          {
            questionId: "clquestion000000000002",
            answerIds: ["clanswer000000000003", "clanswer000000000004"],
            correctAnswerIds: ["clanswer000000000003"],
          },
        ],
      });
      expect(result).toEqual({
        sessionId: "session-1",
        missionId: sampleMission.id,
        questions: [
          {
            id: "clquestion000000000001",
            prompt: "What is phishing?",
            answers: [
              { id: "clanswer000000000001", text: "Social engineering" },
              { id: "clanswer000000000002", text: "A firewall" },
            ],
          },
          {
            id: "clquestion000000000002",
            prompt: "Best password practice?",
            answers: [
              { id: "clanswer000000000003", text: "Long unique passwords" },
              { id: "clanswer000000000004", text: "Reuse one password" },
            ],
          },
        ],
      });
      expect(JSON.stringify(result)).not.toContain("isCorrect");
      expect(JSON.stringify(result)).not.toContain("correctAnswerIds");
    });

    it("throws NotFoundException when the mission does not exist", async () => {
      const mocks = createMocks();
      mocks.missionModel.findUnique.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(service.startMission("player-1", "missing-mission")).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mocks.gameSessions.create).not.toHaveBeenCalled();
    });
  });

  describe("submitAnswer", () => {
    it("returns isCorrect from the session without querying the database and records the answer", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      const service = createService(mocks);

      const correct = await service.submitAnswer("player-1", sampleMission.id, {
        sessionId: "session-1",
        questionId: "clquestion000000000001",
        answerId: "clanswer000000000001",
      });
      const wrong = await service.submitAnswer("player-1", sampleMission.id, {
        sessionId: "session-1",
        questionId: "clquestion000000000001",
        answerId: "clanswer000000000002",
      });

      expect(correct).toEqual({ isCorrect: true });
      expect(wrong).toEqual({ isCorrect: false });
      expect(mocks.missionModel.findUnique).not.toHaveBeenCalled();
      expect(mocks.attemptModel.findUnique).not.toHaveBeenCalled();
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
      expect(mocks.gameSessions.save).toHaveBeenCalledWith(
        expect.objectContaining({
          answers: [{ questionId: "clquestion000000000001", answerId: "clanswer000000000002" }],
        }),
      );
    });

    it("throws NotFoundException when the session is missing or expired", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(
        service.submitAnswer("player-1", sampleMission.id, {
          sessionId: "session-1",
          questionId: "clquestion000000000001",
          answerId: "clanswer000000000001",
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mocks.gameSessions.save).not.toHaveBeenCalled();
    });

    it("rejects a session or submission that is not valid for this player and mission", async () => {
      const mocks = createMocks();
      const service = createService(mocks);
      const base = {
        sessionId: "session-1",
        questionId: "clquestion000000000001",
        answerId: "clanswer000000000001",
      };

      mocks.gameSessions.get.mockResolvedValue(createSampleSession({ playerId: "player-2" }));
      await expect(service.submitAnswer("player-1", sampleMission.id, base)).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      mocks.gameSessions.get.mockResolvedValue(createSampleSession({ missionId: "other-mission" }));
      await expect(service.submitAnswer("player-1", sampleMission.id, base)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      await expect(
        service.submitAnswer("player-1", sampleMission.id, {
          ...base,
          questionId: "foreign-question",
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.submitAnswer("player-1", sampleMission.id, { ...base, answerId: "foreign-answer" }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(mocks.gameSessions.save).not.toHaveBeenCalled();
    });
  });

  describe("completeMission", () => {
    const completeAnswers = [
      { questionId: "clquestion000000000001", answerId: "clanswer000000000001" },
      { questionId: "clquestion000000000002", answerId: "clanswer000000000003" },
    ];

    it("throws when the session is missing, owned by another player, or bound to another mission", async () => {
      const mocks = createMocks();
      const service = createService(mocks);

      mocks.gameSessions.get.mockResolvedValue(null);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(NotFoundException);

      mocks.gameSessions.get.mockResolvedValue(createSampleSession({ playerId: "player-2" }));
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(ForbiddenException);

      mocks.gameSessions.get.mockResolvedValue(createSampleSession({ missionId: "other-mission" }));
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(mocks.attemptModel.create).not.toHaveBeenCalled();
      expect(mocks.gameSessions.delete).not.toHaveBeenCalled();
      expect(mocks.realtime.emitRankingUpdated).not.toHaveBeenCalled();
      expect(mocks.realtime.emitPlayerScoreUpdated).not.toHaveBeenCalled();
    });

    it("throws NotFoundException when the mission does not exist", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      mocks.missionModel.findUnique.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mocks.attemptModel.create).not.toHaveBeenCalled();
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
      expect(mocks.gameSessions.delete).not.toHaveBeenCalled();
      expect(mocks.realtime.emitRankingUpdated).not.toHaveBeenCalled();
    });

    it("completes the mission, awards points from the session's correct data, deletes the session and emits events", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      mocks.missionModel.findUnique.mockResolvedValue({ points: sampleMission.points });
      mocks.attemptModel.findUnique.mockResolvedValue(null);
      mocks.attemptModel.create.mockResolvedValue(sampleCompletion);
      mocks.playerModel.update.mockResolvedValue(updatedPlayer);
      const service = createService(mocks);

      const result = await service.completeMission("player-1", sampleMission.id, "session-1", [
        { questionId: "clquestion000000000001", answerId: "clanswer000000000001" },
        { questionId: "clquestion000000000002", answerId: "clanswer000000000004" },
      ]);

      expect(mocks.attemptModel.create).toHaveBeenCalledWith({
        data: { playerId: "player-1", missionId: sampleMission.id, score: 50 },
      });
      expect(mocks.playerModel.update).toHaveBeenCalledWith({
        where: { id: "player-1" },
        data: { points: { increment: 50 } },
      });
      expect(result).toEqual({
        completion: {
          id: sampleCompletion.id,
          missionId: sampleCompletion.missionId,
          completedAt: sampleCompletion.completedAt.toISOString(),
        },
        correctCount: 1,
        totalQuestions: 2,
        pointsAwarded: 50,
        playerPoints: 150,
      });
      expect(mocks.gameSessions.delete).toHaveBeenCalledWith("session-1");
      expect(mocks.realtime.emitRankingUpdated).toHaveBeenCalledOnce();
      expect(mocks.realtime.emitPlayerScoreUpdated).toHaveBeenCalledWith("player-1", 150);
    });

    it("rejects malformed submissions", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      const service = createService(mocks);

      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", [
          { questionId: "foreign-question", answerId: "clanswer000000000001" },
          { questionId: "clquestion000000000002", answerId: "clanswer000000000003" },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", [
          { questionId: "clquestion000000000001", answerId: "clanswer000000000003" },
          { questionId: "clquestion000000000002", answerId: "clanswer000000000004" },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", [
          { questionId: "clquestion000000000001", answerId: "clanswer000000000001" },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", [
          ...completeAnswers,
          { questionId: "clquestion000000000001", answerId: "clanswer000000000002" },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", [
          { questionId: "clquestion000000000001", answerId: "clanswer000000000001" },
          { questionId: "clquestion000000000001", answerId: "clanswer000000000002" },
          { questionId: "clquestion000000000002", answerId: "clanswer000000000003" },
        ]),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(mocks.attemptModel.create).not.toHaveBeenCalled();
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
      expect(mocks.gameSessions.delete).not.toHaveBeenCalled();
    });

    it("rejects a duplicate completion, whether already recorded or under a concurrent race", async () => {
      const mocks = createMocks();
      mocks.gameSessions.get.mockResolvedValue(createSampleSession());
      mocks.missionModel.findUnique.mockResolvedValue({ points: sampleMission.points });
      mocks.attemptModel.findUnique.mockResolvedValue(sampleCompletion);
      const service = createService(mocks);

      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(mocks.gameSessions.delete).not.toHaveBeenCalled();
      expect(mocks.realtime.emitRankingUpdated).not.toHaveBeenCalled();

      mocks.attemptModel.findUnique.mockResolvedValue(null);
      const uniqueViolation = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.9.1",
      });
      mocks.attemptModel.create.mockRejectedValue(uniqueViolation);
      await expect(
        service.completeMission("player-1", sampleMission.id, "session-1", completeAnswers),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(mocks.playerModel.update).not.toHaveBeenCalled();
      expect(mocks.gameSessions.delete).not.toHaveBeenCalled();
      expect(mocks.realtime.emitRankingUpdated).not.toHaveBeenCalled();
      expect(mocks.realtime.emitPlayerScoreUpdated).not.toHaveBeenCalled();
    });
  });

  describe("getCompletedMissionIds", () => {
    it("returns the mission ids of the player's completions", async () => {
      const mocks = createMocks();
      mocks.attemptModel.findMany.mockResolvedValue([
        { missionId: "mission-1" },
        { missionId: "mission-2" },
      ]);
      const service = createService(mocks);

      const result = await service.getCompletedMissionIds("player-1");

      expect(mocks.attemptModel.findMany).toHaveBeenCalledWith({
        where: { playerId: "player-1" },
        select: { missionId: true },
      });
      expect(result).toEqual({ missionIds: ["mission-1", "mission-2"] });
    });

    it("returns an empty list when the player has no completions", async () => {
      const mocks = createMocks();
      mocks.attemptModel.findMany.mockResolvedValue([]);
      const service = createService(mocks);

      const result = await service.getCompletedMissionIds("player-1");

      expect(result).toEqual({ missionIds: [] });
    });
  });
});

import type {
  CompletedMissionIdsResponse,
  CompleteMissionRequest,
  CompleteMissionResponse,
  Mission,
  MissionQuestionsResponse,
  StartMissionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "@cyber/contracts";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/infrastructure/database/prisma.service.js";

import { RealtimeGateway } from "@/modules/realtime/realtime.gateway.js";

import { GameSessionService } from "./game-session.service.js";

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly gameSessions: GameSessionService,
  ) {}

  async listMissions(): Promise<Mission[]> {
    const missions = await this.prisma.mission.findMany();

    return missions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      difficulty: mission.difficulty,
      points: mission.points,
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
    }));
  }

  async getCompletedMissionIds(playerId: string): Promise<CompletedMissionIdsResponse> {
    const attempts = await this.prisma.attempt.findMany({
      where: { playerId },
      select: { missionId: true },
    });

    return { missionIds: attempts.map((attempt) => attempt.missionId) };
  }

  async getMissionQuestions(missionId: string): Promise<MissionQuestionsResponse> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
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

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    return { missionId: mission.id, questions: mission.questions };
  }

  async startMission(playerId: string, missionId: string): Promise<StartMissionResponse> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        questions: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            prompt: true,
            answers: {
              orderBy: { id: "asc" },
              select: { id: true, text: true, isCorrect: true },
            },
          },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    const sessionId = await this.gameSessions.create({
      playerId,
      missionId: mission.id,
      questions: mission.questions.map((question) => ({
        questionId: question.id,
        answerIds: question.answers.map((answer) => answer.id),
        correctAnswerIds: question.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.id),
      })),
    });

    return {
      sessionId,
      missionId: mission.id,
      questions: mission.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answers: question.answers.map(({ id, text }) => ({ id, text })),
      })),
    };
  }

  async submitAnswer(
    playerId: string,
    missionId: string,
    dto: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> {
    const session = await this.gameSessions.get(dto.sessionId);
    if (!session) {
      throw new NotFoundException("Game session not found or expired");
    }
    if (session.playerId !== playerId) {
      throw new ForbiddenException("Game session does not belong to this player");
    }
    if (session.missionId !== missionId) {
      throw new BadRequestException("Game session does not match this mission");
    }

    const question = session.questions.find((item) => item.questionId === dto.questionId);
    if (!question) {
      throw new BadRequestException("Question does not belong to this mission");
    }
    if (!question.answerIds.includes(dto.answerId)) {
      throw new BadRequestException("Answer does not belong to this question");
    }

    const recorded = session.answers.find((item) => item.questionId === dto.questionId);
    if (recorded) {
      recorded.answerId = dto.answerId;
    } else {
      session.answers.push({ questionId: dto.questionId, answerId: dto.answerId });
    }

    await this.gameSessions.save(session);

    return { isCorrect: question.correctAnswerIds.includes(dto.answerId) };
  }

  async completeMission(
    playerId: string,
    missionId: string,
    sessionId: string,
    answers: CompleteMissionRequest["answers"],
  ): Promise<CompleteMissionResponse> {
    const session = await this.gameSessions.get(sessionId);
    if (!session) {
      throw new NotFoundException("Game session not found or expired");
    }
    if (session.playerId !== playerId) {
      throw new ForbiddenException("Game session does not belong to this player");
    }
    if (session.missionId !== missionId) {
      throw new BadRequestException("Game session does not match this mission");
    }

    const questionsById = new Map(
      session.questions.map((question) => [question.questionId, question]),
    );

    if (answers.length !== session.questions.length) {
      throw new BadRequestException("Must submit exactly one answer per question");
    }

    const seenQuestions = new Set<string>();
    for (const submitted of answers) {
      const question = questionsById.get(submitted.questionId);
      if (!question) {
        throw new BadRequestException("Question does not belong to this mission");
      }
      if (seenQuestions.has(submitted.questionId)) {
        throw new BadRequestException("Multiple answers submitted for the same question");
      }
      seenQuestions.add(submitted.questionId);

      if (!question.answerIds.includes(submitted.answerId)) {
        throw new BadRequestException("Answer does not belong to this question");
      }
    }

    const correctCount = answers.filter((submitted) =>
      questionsById.get(submitted.questionId)?.correctAnswerIds.includes(submitted.answerId),
    ).length;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const mission = await tx.mission.findUnique({
          where: { id: missionId },
          select: { points: true },
        });
        if (!mission) {
          throw new NotFoundException("Mission not found");
        }

        const existing = await tx.attempt.findUnique({
          where: { playerId_missionId: { playerId, missionId } },
        });
        if (existing) {
          throw new ConflictException("Mission already completed");
        }

        const totalQuestions = session.questions.length;
        const score = correctCount * mission.points;

        const completion = await tx.attempt.create({
          data: { playerId, missionId, score },
        });

        const player = await tx.player.update({
          where: { id: playerId },
          data: { points: { increment: score } },
        });

        return {
          completion: {
            id: completion.id,
            missionId: completion.missionId,
            completedAt: completion.completedAt.toISOString(),
          },
          correctCount,
          totalQuestions,
          pointsAwarded: score,
          playerPoints: player.points,
        };
      });

      await this.gameSessions.delete(sessionId);
      this.realtime.emitRankingUpdated();
      this.realtime.emitPlayerScoreUpdated(playerId, result.playerPoints);

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Mission already completed");
      }
      throw error;
    }
  }
}

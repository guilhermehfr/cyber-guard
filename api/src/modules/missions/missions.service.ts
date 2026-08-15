import type {
  CompletedMissionIdsResponse,
  CompleteMissionRequest,
  CompleteMissionResponse,
  Mission,
  MissionQuestionsResponse,
} from "@cyber/contracts";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PrismaService } from "@/infrastructure/database/prisma.service.js";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { RealtimeGateway } from "@/modules/realtime/realtime.gateway.js";

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
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

  async completeMission(
    playerId: string,
    missionId: string,
    answers: CompleteMissionRequest["answers"],
  ): Promise<CompleteMissionResponse> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const mission = await tx.mission.findUnique({
          where: { id: missionId },
          include: { questions: { include: { answers: true } } },
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

        const questionsById = new Map(mission.questions.map((question) => [question.id, question]));
        const answersByQuestion = new Map(
          mission.questions.map((question) => [
            question.id,
            new Map(question.answers.map((answer) => [answer.id, answer])),
          ]),
        );

        if (answers.length !== mission.questions.length) {
          throw new BadRequestException("Must submit exactly one answer per question");
        }

        const seenQuestions = new Set<string>();
        for (const submitted of answers) {
          if (!questionsById.has(submitted.questionId)) {
            throw new BadRequestException("Question does not belong to this mission");
          }
          if (seenQuestions.has(submitted.questionId)) {
            throw new BadRequestException("Multiple answers submitted for the same question");
          }
          seenQuestions.add(submitted.questionId);

          const questionAnswers = answersByQuestion.get(submitted.questionId);
          if (!questionAnswers?.has(submitted.answerId)) {
            throw new BadRequestException("Answer does not belong to this question");
          }
        }

        let correctCount = 0;
        for (const submitted of answers) {
          if (answersByQuestion.get(submitted.questionId)?.get(submitted.answerId)?.isCorrect) {
            correctCount += 1;
          }
        }

        const totalQuestions = mission.questions.length;
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

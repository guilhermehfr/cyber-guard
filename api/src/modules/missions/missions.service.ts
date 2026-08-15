import type { CompleteMissionResponse, Mission } from "@cyber/contracts";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PrismaService } from "@/infrastructure/database/prisma.service.js";

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async completeMission(playerId: string, missionId: string): Promise<CompleteMissionResponse> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const mission = await tx.mission.findUnique({ where: { id: missionId } });
        if (!mission) {
          throw new NotFoundException("Mission not found");
        }

        const existing = await tx.attempt.findUnique({
          where: { playerId_missionId: { playerId, missionId } },
        });
        if (existing) {
          throw new ConflictException("Mission already completed");
        }

        const completion = await tx.attempt.create({
          data: { playerId, missionId },
        });

        const player = await tx.player.update({
          where: { id: playerId },
          data: { points: { increment: mission.points } },
        });

        return {
          completion: {
            id: completion.id,
            missionId: completion.missionId,
            completedAt: completion.completedAt.toISOString(),
          },
          pointsAwarded: mission.points,
          playerPoints: player.points,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Mission already completed");
      }
      throw error;
    }
  }
}

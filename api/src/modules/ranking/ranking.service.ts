import type { RankingCurrentPlayer, RankingResponse } from "@cyber/contracts";
import { Injectable } from "@nestjs/common";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PrismaService } from "@/infrastructure/database/prisma.service.js";

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopPlayers(playerId?: string | null): Promise<RankingResponse> {
    const players = await this.prisma.player.findMany({
      select: { id: true, name: true, points: true },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }, { id: "asc" }],
      take: 10,
    });

    const entries = players.map((player, index) => ({
      position: index + 1,
      id: player.id,
      name: player.name,
      points: player.points,
    }));

    const currentPlayer = playerId ? await this.getCurrentPlayer(playerId) : null;

    return { entries, currentPlayer };
  }

  private async getCurrentPlayer(playerId: string): Promise<RankingCurrentPlayer | null> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, points: true, createdAt: true },
    });
    if (!player) {
      return null;
    }

    const ahead = await this.prisma.player.count({
      where: {
        OR: [
          { points: { gt: player.points } },
          { points: player.points, createdAt: { lt: player.createdAt } },
          { points: player.points, createdAt: player.createdAt, id: { lt: player.id } },
        ],
      },
    });

    return { position: ahead + 1, id: player.id, points: player.points };
  }
}

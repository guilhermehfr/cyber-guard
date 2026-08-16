import { Injectable } from "@nestjs/common";
import type { Player } from "@prisma/client";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PrismaService } from "@/infrastructure/database/prisma.service.js";

export interface CreatePlayerInput {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreatePlayerInput & { googleId?: string | null }): Promise<Player> {
    return this.prisma.player.create({ data: input });
  }

  findByEmail(email: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { googleId } });
  }

  linkGoogleId(playerId: string, googleId: string): Promise<Player> {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { googleId },
    });
  }

  findById(id: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { id } });
  }

  countCompletedMissions(playerId: string): Promise<number> {
    return this.prisma.attempt.count({ where: { playerId } });
  }
}

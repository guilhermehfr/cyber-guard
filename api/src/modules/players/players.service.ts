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

  create(input: CreatePlayerInput): Promise<Player> {
    return this.prisma.player.create({ data: input });
  }

  findByEmail(email: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { email } });
  }

  findById(id: string): Promise<Player | null> {
    return this.prisma.player.findUnique({ where: { id } });
  }
}

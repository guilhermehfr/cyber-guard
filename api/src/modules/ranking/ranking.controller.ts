import type { RankingResponse } from "@cyber/contracts";
import { Controller, Get, Req } from "@nestjs/common";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { JwtService } from "@nestjs/jwt";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { RankingService } from "./ranking.service.js";

@Controller("ranking")
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getRanking(
    @Req() request: { headers: { authorization?: string } },
  ): Promise<RankingResponse> {
    return this.rankingService.getTopPlayers(
      await this.extractPlayerId(request.headers.authorization),
    );
  }

  private async extractPlayerId(authorization?: string): Promise<string | null> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string }>(token);
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
}

import type { RankingResponse } from "@cyber/contracts";
import { Controller, Get, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { JwtService } from "@nestjs/jwt";

import type { AppConfig } from "@/config/config.js";

import { RankingService } from "./ranking.service.js";

interface RankingRequest {
  headers: { authorization?: string };
  cookies?: Record<string, string>;
}

@Controller("ranking")
export class RankingController {
  constructor(
    private readonly rankingService: RankingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getRanking(@Req() request: RankingRequest): Promise<RankingResponse> {
    return this.rankingService.getTopPlayers(await this.extractPlayerId(request));
  }

  private async extractPlayerId(request: RankingRequest): Promise<string | null> {
    const cookieName =
      this.configService.getOrThrow<AppConfig["auth"]["cookie"]["name"]>("auth.cookie.name");
    const authorization = request.headers.authorization;
    const token =
      request.cookies?.[cookieName] ??
      (authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined);

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

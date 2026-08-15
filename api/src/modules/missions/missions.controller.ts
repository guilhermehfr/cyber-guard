import type { CompleteMissionResponse, Mission } from "@cyber/contracts";
import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard.js";
import type { AuthenticatedUser } from "@/modules/auth/strategies/jwt.strategy.js";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { MissionsService } from "./missions.service.js";

@Controller("missions")
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  list(): Promise<Mission[]> {
    return this.missionsService.listMissions();
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/complete")
  complete(
    @Param("id") missionId: string,
    @Req() request: { user: AuthenticatedUser },
  ): Promise<CompleteMissionResponse> {
    return this.missionsService.completeMission(request.user.id, missionId);
  }
}

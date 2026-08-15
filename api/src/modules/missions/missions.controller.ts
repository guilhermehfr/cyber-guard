import type {
  AuthenticatedUser,
  CompletedMissionIdsResponse,
  CompleteMissionResponse,
  Mission,
  MissionQuestionsResponse,
} from "@cyber/contracts";
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard.js";

// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { CompleteMissionDto } from "./dto/complete-mission.dto.js";
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
  @Get("completed")
  completed(@Req() request: { user: AuthenticatedUser }): Promise<CompletedMissionIdsResponse> {
    return this.missionsService.getCompletedMissionIds(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/questions")
  questions(@Param("id") missionId: string): Promise<MissionQuestionsResponse> {
    return this.missionsService.getMissionQuestions(missionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/complete")
  complete(
    @Param("id") missionId: string,
    @Body() dto: CompleteMissionDto,
    @Req() request: { user: AuthenticatedUser },
  ): Promise<CompleteMissionResponse> {
    return this.missionsService.completeMission(request.user.id, missionId, dto.answers);
  }
}

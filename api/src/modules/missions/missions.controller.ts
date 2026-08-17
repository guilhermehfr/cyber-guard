import type {
  AuthenticatedUser,
  CompletedMissionIdsResponse,
  CompleteMissionResponse,
  Mission,
  MissionQuestionsResponse,
  StartMissionResponse,
  SubmitAnswerResponse,
} from "@cyber/contracts";
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard.js";

import { CompleteMissionDto } from "./dto/complete-mission.dto.js";
import { SubmitAnswerDto } from "./dto/submit-answer.dto.js";
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
  @Post(":id/start")
  start(
    @Param("id") missionId: string,
    @Req() request: { user: AuthenticatedUser },
  ): Promise<StartMissionResponse> {
    return this.missionsService.startMission(request.user.id, missionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/answer")
  answer(
    @Param("id") missionId: string,
    @Body() dto: SubmitAnswerDto,
    @Req() request: { user: AuthenticatedUser },
  ): Promise<SubmitAnswerResponse> {
    return this.missionsService.submitAnswer(request.user.id, missionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/complete")
  complete(
    @Param("id") missionId: string,
    @Body() dto: CompleteMissionDto,
    @Req() request: { user: AuthenticatedUser },
  ): Promise<CompleteMissionResponse> {
    return this.missionsService.completeMission(
      request.user.id,
      missionId,
      dto.sessionId,
      dto.answers,
    );
  }
}

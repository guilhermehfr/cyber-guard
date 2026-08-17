import { Module } from "@nestjs/common";

import { RedisModule } from "@/infrastructure/redis/redis.module.js";
import { RealtimeModule } from "@/modules/realtime/realtime.module.js";

import { GameSessionService } from "./game-session.service.js";
import { MissionsController } from "./missions.controller.js";
import { MissionsService } from "./missions.service.js";

@Module({
  imports: [RealtimeModule, RedisModule],
  controllers: [MissionsController],
  providers: [MissionsService, GameSessionService],
  exports: [MissionsService],
})
export class MissionsModule {}

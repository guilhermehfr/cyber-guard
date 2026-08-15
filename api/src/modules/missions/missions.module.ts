import { Module } from "@nestjs/common";

import { RealtimeModule } from "@/modules/realtime/realtime.module.js";

import { MissionsController } from "./missions.controller.js";
import { MissionsService } from "./missions.service.js";

@Module({
  imports: [RealtimeModule],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}

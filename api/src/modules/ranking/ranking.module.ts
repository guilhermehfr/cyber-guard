import { Module } from "@nestjs/common";

import { AuthModule } from "@/modules/auth/auth.module.js";

import { RankingController } from "./ranking.controller.js";
import { RankingService } from "./ranking.service.js";

@Module({
  imports: [AuthModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}

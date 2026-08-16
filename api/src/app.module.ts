import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configuration } from "@/config/config.js";
import { envValidationSchema } from "@/config/env.validation.js";

import { PrismaModule } from "@/infrastructure/database/prisma.module.js";
import { RedisModule } from "@/infrastructure/redis/redis.module.js";

import { AuthModule } from "@/modules/auth/auth.module.js";
import { MissionsModule } from "@/modules/missions/missions.module.js";
import { PlayersModule } from "@/modules/players/players.module.js";
import { RankingModule } from "@/modules/ranking/ranking.module.js";
import { RealtimeModule } from "@/modules/realtime/realtime.module.js";

import { HealthController } from "@/health.controller.js";

const envFilePath = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath, ".env"],
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    MissionsModule,
    PlayersModule,
    RankingModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

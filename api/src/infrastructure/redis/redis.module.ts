import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

import type { AppConfig } from "@/config/config.js";

import { REDIS_CLIENT } from "./redis.constants.js";
import { RedisService } from "./redis.service.js";

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const redis = configService.getOrThrow<AppConfig["redis"]>("redis");
        return new Redis(redis.url, { lazyConnect: true });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Redis } from "ioredis";

import type { AppConfig } from "@/config/config.js";

import { REDIS_CLIENT } from "./redis.constants.js";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.configService.getOrThrow<AppConfig["redis"]>("redis").ttlSeconds;
    await this.client.set(key, value, "EX", ttl);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}

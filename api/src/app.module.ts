import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configuration } from "@/config/config.js";
import { envValidationSchema } from "@/config/env.validation.js";

import { HealthController } from "@/health.controller.js";
import { PrismaModule } from "@/infrastructure/database/prisma.module.js";

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
  ],
  controllers: [HealthController],
})
export class AppModule {}
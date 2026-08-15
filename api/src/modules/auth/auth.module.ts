import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { JwtSignOptions } from "@nestjs/jwt";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import type { AppConfig } from "@/config/config.js";
import { PlayersModule } from "@/modules/players/players.module.js";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordService } from "./password.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<AppConfig["jwt"]["secret"]>("jwt.secret"),
        signOptions: {
          expiresIn: configService.getOrThrow<AppConfig["jwt"]["expiresIn"]>(
            "jwt.expiresIn",
          ) as JwtSignOptions["expiresIn"],
        },
      }),
    }),
    PlayersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService],
  exports: [JwtModule],
})
export class AuthModule {}

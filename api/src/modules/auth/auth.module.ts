import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { PlayersModule } from "@/modules/players/players.module.js";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordService } from "./password.service.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt" }), PlayersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService],
})
export class AuthModule {}

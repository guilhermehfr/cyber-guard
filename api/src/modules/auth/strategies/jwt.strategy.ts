import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { AppConfig } from "@/config/config.js";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<AppConfig["jwt"]["secret"]>("jwt.secret"),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}

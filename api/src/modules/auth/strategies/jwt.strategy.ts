import type { AuthenticatedUser, JwtPayload } from "@cyber/contracts";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { AppConfig } from "@/config/config.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const cookieName =
      configService.getOrThrow<AppConfig["auth"]["cookie"]["name"]>("auth.cookie.name");

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: unknown): string | null => {
          const cookies = (request as { cookies?: Record<string, string> | undefined }).cookies;
          return cookies?.[cookieName] ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<AppConfig["jwt"]["secret"]>("jwt.secret"),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}

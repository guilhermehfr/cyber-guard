import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Profile } from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";

import type { AppConfig } from "@/config/config.js";
import { type AuthResult, AuthService } from "@/modules/auth/auth.service.js";

import { OAuthStateStore } from "../oauth-state.store.js";
import { mapGoogleProfile } from "./google-profile.js";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly clientId: string;
  private readonly callbackUrl: string;
  private readonly scope = ["openid", "email", "profile"];

  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
    stateStore: OAuthStateStore,
  ) {
    const { clientId, clientSecret, callbackUrl } =
      configService.getOrThrow<AppConfig["google"]>("google");

    super({
      clientID: clientId,
      clientSecret,
      callbackURL: callbackUrl,
      scope: ["openid", "email", "profile"],
      state: true,
      store: stateStore,
    });

    this.clientId = clientId;
    this.callbackUrl = callbackUrl;
  }

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: this.scope.join(" "),
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthResult> {
    return this.authService.authenticateWithGoogle(mapGoogleProfile(profile));
  }
}

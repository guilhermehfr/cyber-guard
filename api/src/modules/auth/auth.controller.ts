import type { AuthenticatedUser, AuthResponse, PlayerProfile } from "@cyber/contracts";
import type { CookieSerializeOptions } from "@fastify/cookie";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import type { AppConfig } from "@/config/config.js";
import { type AuthResult, AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";
import { GoogleOAuthExceptionFilter } from "./google-oauth-exception.filter.js";
import { GoogleAuthGuard } from "./guards/google-auth.guard.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { OAuthStateStore } from "./oauth-state.store.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";

export interface AuthCookieReply {
  setCookie(name: string, value: string, options: CookieSerializeOptions): void;
  clearCookie(name: string, options?: CookieSerializeOptions): void;
}

interface AuthCallbackReply extends AuthCookieReply {
  redirect(url: string, statusCode: number): unknown;
}

export interface GoogleAuthRedirectReply {
  code(statusCode: number): GoogleAuthRedirectReply;
  redirect(url: string): unknown;
}

/**
 * Partitioned cookies (CHIPS) keep the session usable when the API and the web
 * app live on different sites and the browser restricts third-party cookies.
 * The attribute requires Secure and only applies to cross-site cookies.
 */
function isPartitioned(
  secure: boolean,
  sameSite: AppConfig["auth"]["cookie"]["sameSite"],
): boolean {
  return secure && sameSite === "none";
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly oauthStateStore: OAuthStateStore,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: AuthCookieReply,
  ): Promise<AuthResponse> {
    const { accessToken, player } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken);
    return { player };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: AuthCookieReply,
  ): Promise<AuthResponse> {
    const { accessToken, player } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken);
    return { player };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  logout(@Res({ passthrough: true }) res: AuthCookieReply): void {
    this.clearAuthCookies(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() request: { user: AuthenticatedUser }): Promise<PlayerProfile> {
    return this.authService.me(request.user.id);
  }

  @Get("google")
  googleAuth(@Res() res: GoogleAuthRedirectReply): void {
    const state = this.oauthStateStore.createState();
    res.code(HttpStatus.FOUND).redirect(this.googleStrategy.getAuthorizeUrl(state));
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @UseFilters(GoogleOAuthExceptionFilter)
  googleCallback(
    @Req() request: { user: AuthResult },
    @Res({ passthrough: true }) res: AuthCallbackReply,
  ): unknown {
    this.setAuthCookies(res, request.user.accessToken);
    return res.redirect(`${this.webUrl}/play`, HttpStatus.FOUND);
  }

  private setAuthCookies(res: AuthCookieReply, accessToken: string): void {
    const { name, markerName, secure, sameSite } =
      this.configService.getOrThrow<AppConfig["auth"]["cookie"]>("auth.cookie");

    const cookieOptions = {
      path: "/",
      secure,
      sameSite,
      partitioned: isPartitioned(secure, sameSite),
      maxAge: this.cookieMaxAgeSeconds(accessToken),
    };

    res.setCookie(name, accessToken, {
      ...cookieOptions,
      httpOnly: true,
    });
    res.setCookie(markerName, "1", {
      ...cookieOptions,
      httpOnly: false,
    });
  }

  private clearAuthCookies(res: AuthCookieReply): void {
    const { name, markerName, secure, sameSite } =
      this.configService.getOrThrow<AppConfig["auth"]["cookie"]>("auth.cookie");

    // The attributes must match the ones used when the cookie was set,
    // otherwise the browser keeps the partitioned cookie in place.
    const clearOptions = {
      path: "/",
      secure,
      sameSite,
      partitioned: isPartitioned(secure, sameSite),
    };

    res.clearCookie(name, clearOptions);
    res.clearCookie(markerName, clearOptions);
  }

  private cookieMaxAgeSeconds(accessToken: string): number | undefined {
    const exp = this.jwtService.decode<{ exp?: number }>(accessToken)?.exp;
    if (exp === undefined) {
      return undefined;
    }
    return Math.max(0, exp - Math.floor(Date.now() / 1000));
  }

  private get webUrl(): string {
    return this.configService.getOrThrow<AppConfig["app"]["webUrl"]>("app.webUrl")[0];
  }
}

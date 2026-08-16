import type { AuthenticatedUser, AuthResponse, PlayerProfile } from "@cyber/contracts";
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseFilters, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { AuthService } from "./auth.service.js";
// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { LoginDto } from "./dto/login.dto.js";
// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { RegisterDto } from "./dto/register.dto.js";
import { GoogleOAuthExceptionFilter } from "./google-oauth-exception.filter.js";
import { GoogleAuthGuard } from "./guards/google-auth.guard.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { OAuthStateStore } from "./oauth-state.store.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";

export interface AuthCookieReply {
  setCookie(name: string, value: string, options: Record<string, unknown>): unknown;
  clearCookie(name: string, options: Record<string, unknown>): unknown;
}

export interface AuthCallbackReply extends AuthCookieReply {
  redirect(url: string, status?: number): unknown;
}

interface GoogleAuthRedirectReply {
  code(status: number): { redirect(url: string): unknown };
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
  ): Promise<{ player: PlayerProfile }> {
    const { accessToken, player } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken);
    return { player };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: AuthCookieReply,
  ): Promise<{ player: PlayerProfile }> {
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
    @Req() request: { user: { accessToken: string } },
    @Res({ passthrough: true }) res: AuthCallbackReply,
  ): unknown {
    this.setAuthCookies(res, request.user.accessToken);
    return res.redirect(`${this.webUrl}/play`, HttpStatus.FOUND);
  }

  private setAuthCookies(res: AuthCookieReply, accessToken: string): void {
    const { name, markerName, secure, sameSite } = this.configService.getOrThrow<{
      name: string;
      markerName: string;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
    }>("auth.cookie");

    const cookieOptions = {
      path: "/",
      secure,
      sameSite,
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
    const { name, markerName } = this.configService.getOrThrow<{ name: string; markerName: string }>(
      "auth.cookie",
    );
    res.clearCookie(name, { path: "/" });
    res.clearCookie(markerName, { path: "/" });
  }

  private cookieMaxAgeSeconds(accessToken: string): number | undefined {
    const exp = this.jwtService.decode(accessToken)?.exp as number | undefined;
    if (exp === undefined) {
      return undefined;
    }
    return Math.max(0, exp - Math.floor(Date.now() / 1000));
  }

  private get webUrl(): string {
    return this.configService.getOrThrow<string[]>("app.webUrl")[0];
  }
}

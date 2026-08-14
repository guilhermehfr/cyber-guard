import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { type AuthResponse, AuthService, type RegisterResponse } from "./auth.service.js";
// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { LoginDto } from "./dto/login.dto.js";
// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { RegisterDto } from "./dto/register.dto.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import type { AuthenticatedUser } from "./strategies/jwt.strategy.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() request: { user: AuthenticatedUser }): AuthenticatedUser {
    return request.user;
  }
}

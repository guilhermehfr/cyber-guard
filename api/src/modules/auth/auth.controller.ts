import { Body, Controller, Post } from "@nestjs/common";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { AuthService, type RegisterResponse } from "./auth.service.js";
// biome-ignore lint/style/useImportType: NestJS validation uses the runtime metatype.
import { RegisterDto } from "./dto/register.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }
}

import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { JwtService } from "@nestjs/jwt";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PlayersService } from "@/modules/players/players.service.js";

import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PasswordService } from "./password.service.js";

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  player: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.playersService.findByEmail(email);
    if (existing) {
      throw new ConflictException("A player with this email already exists");
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const player = await this.playersService.create({
      name: dto.name,
      email,
      passwordHash,
    });

    return {
      id: player.id,
      name: player.name,
      email: player.email,
      createdAt: player.createdAt,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const player = await this.playersService.findByEmail(email);

    if (!player?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await this.passwordService.verify(dto.password, player.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: player.id,
      email: player.email,
      name: player.name,
    });

    return {
      accessToken,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
      },
    };
  }
}

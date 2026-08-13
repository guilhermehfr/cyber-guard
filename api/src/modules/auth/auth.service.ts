import { ConflictException, Injectable } from "@nestjs/common";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PlayersService } from "@/modules/players/players.service.js";

import type { RegisterDto } from "./dto/register.dto.js";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PasswordService } from "./password.service.js";

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const existing = await this.playersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("A player with this email already exists");
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const player = await this.playersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return {
      id: player.id,
      name: player.name,
      email: player.email,
      createdAt: player.createdAt,
    };
  }
}

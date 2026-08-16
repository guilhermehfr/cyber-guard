import type { AuthResponse, PlayerProfile } from "@cyber/contracts";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { JwtService } from "@nestjs/jwt";
import type { Player } from "@prisma/client";

// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PlayersService } from "@/modules/players/players.service.js";

import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
// biome-ignore lint/style/useImportType: NestJS DI requires the runtime class reference.
import { PasswordService } from "./password.service.js";
import { GoogleOAuthFailureException } from "./google-oauth-error.js";
import type { GoogleIdentity } from "./strategies/google-profile.js";

export interface AuthResult {
  accessToken: string;
  player: PlayerProfile;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
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

    const accessToken = await this.signToken(player);

    return {
      accessToken,
      player: await this.toPlayerProfile(player, 0),
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

    const completedMissions = await this.playersService.countCompletedMissions(player.id);

    return {
      accessToken: await this.signToken(player),
      player: await this.toPlayerProfile(player, completedMissions),
    };
  }

  async me(playerId: string): Promise<PlayerProfile> {
    const player = await this.playersService.findById(playerId);
    if (!player) {
      throw new UnauthorizedException();
    }

    const completedMissions = await this.playersService.countCompletedMissions(player.id);

    return this.toPlayerProfile(player, completedMissions);
  }

  async authenticateWithGoogle(identity: GoogleIdentity): Promise<AuthResult> {
    const existingByGoogleId = await this.playersService.findByGoogleId(identity.googleId);
    if (existingByGoogleId) {
      return this.toAuthResult(existingByGoogleId);
    }

    const existingByEmail = await this.playersService.findByEmail(identity.email);
    if (existingByEmail) {
      if (existingByEmail.googleId !== null) {
        throw new GoogleOAuthFailureException();
      }

      const linked = await this.playersService.linkGoogleId(existingByEmail.id, identity.googleId);
      return this.toAuthResult(linked);
    }

    const created = await this.playersService.create({
      name: identity.name,
      email: identity.email,
      googleId: identity.googleId,
      passwordHash: null,
    });

    return this.toAuthResult(created);
  }

  private async toAuthResult(player: Player): Promise<AuthResult> {
    const completedMissions = await this.playersService.countCompletedMissions(player.id);

    return {
      accessToken: await this.signToken(player),
      player: await this.toPlayerProfile(player, completedMissions),
    };
  }

  private signToken(player: Player): Promise<string> {
    return this.jwtService.signAsync({
      sub: player.id,
      email: player.email,
      name: player.name,
    });
  }

  private async toPlayerProfile(player: Player, completedMissions: number): Promise<PlayerProfile> {
    return {
      id: player.id,
      name: player.name,
      email: player.email,
      points: player.points,
      completedMissions,
    };
  }
}

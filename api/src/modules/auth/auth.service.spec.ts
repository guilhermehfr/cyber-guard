import { ConflictException, UnauthorizedException } from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import type { Player } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import type { PlayersService } from "@/modules/players/players.service.js";

import { AuthService } from "./auth.service.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { PasswordService } from "./password.service.js";

const player: Player = {
  id: "cltest0000000000000001",
  name: "Ada",
  email: "ada@example.com",
  passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$test-hash",
  points: 0,
  createdAt: new Date("2026-08-14T12:00:00.000Z"),
  updatedAt: new Date("2026-08-14T12:00:00.000Z"),
};

const playerProfile = {
  id: player.id,
  name: player.name,
  email: player.email,
  points: 0,
  completedMissions: 0,
};

function createMocks() {
  const findByEmail = vi.fn();
  const findById = vi.fn();
  const create = vi.fn();
  const countCompletedMissions = vi.fn();
  const hash = vi.fn();
  const verify = vi.fn();
  const signAsync = vi.fn();

  const playersService = {
    findByEmail,
    findById,
    create,
    countCompletedMissions,
  } as unknown as PlayersService;
  const passwordService = { hash, verify } as unknown as PasswordService;
  const jwtService = { signAsync } as unknown as JwtService;

  return {
    findByEmail,
    findById,
    create,
    countCompletedMissions,
    hash,
    verify,
    signAsync,
    playersService,
    passwordService,
    jwtService,
  };
}

function createService(mocks: ReturnType<typeof createMocks>): AuthService {
  return new AuthService(mocks.playersService, mocks.passwordService, mocks.jwtService);
}

const registerDto = {
  name: "Ada",
  email: "ada@example.com",
  password: "s3cret-password",
} as RegisterDto;
const loginDto = { email: "ada@example.com", password: "s3cret-password" } as LoginDto;

describe("AuthService", () => {
  describe("register", () => {
    it("normalizes the email, persists the hashed password, and returns an access token", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(null);
      mocks.hash.mockResolvedValue("hashed-password");
      mocks.create.mockResolvedValue(player);
      mocks.signAsync.mockResolvedValue("signed-token");
      const service = createService(mocks);

      const result = await service.register({ ...registerDto, email: "  Ada@Example.com  " });

      expect(mocks.findByEmail).toHaveBeenCalledWith("ada@example.com");
      expect(mocks.hash).toHaveBeenCalledWith("s3cret-password");
      expect(mocks.create).toHaveBeenCalledWith({
        name: "Ada",
        email: "ada@example.com",
        passwordHash: "hashed-password",
      });
      expect(result).toEqual({
        accessToken: "signed-token",
        player: playerProfile,
      });
    });

    it("does not expose the password or its hash in the response", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(null);
      mocks.hash.mockResolvedValue("hashed-password");
      mocks.create.mockResolvedValue(player);
      mocks.signAsync.mockResolvedValue("signed-token");
      const service = createService(mocks);

      const result = await service.register(registerDto);

      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("passwordHash");
      expect(JSON.stringify(result)).not.toContain("hashed-password");
    });

    it("rejects a duplicate email with ConflictException", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(player);
      const service = createService(mocks);

      await expect(service.register(registerDto)).rejects.toBeInstanceOf(ConflictException);
      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("returns an access token and the expanded player on valid credentials", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(player);
      mocks.verify.mockResolvedValue(true);
      mocks.countCompletedMissions.mockResolvedValue(0);
      mocks.signAsync.mockResolvedValue("signed-token");
      const service = createService(mocks);

      const result = await service.login({ ...loginDto, email: "  ADA@Example.com  " });

      expect(mocks.verify).toHaveBeenCalledWith("s3cret-password", player.passwordHash);
      expect(mocks.countCompletedMissions).toHaveBeenCalledWith(player.id);
      expect(mocks.signAsync).toHaveBeenCalledWith({
        sub: player.id,
        email: "ada@example.com",
        name: player.name,
      });
      expect(result).toEqual({
        accessToken: "signed-token",
        player: playerProfile,
      });
    });

    it("does not place the password or its hash in the JWT payload", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(player);
      mocks.verify.mockResolvedValue(true);
      mocks.countCompletedMissions.mockResolvedValue(0);
      mocks.signAsync.mockResolvedValue("signed-token");
      const service = createService(mocks);

      await service.login(loginDto);

      const payload = mocks.signAsync.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(payload).toEqual({ sub: player.id, email: player.email, name: player.name });
      expect(payload).not.toHaveProperty("password");
      expect(payload).not.toHaveProperty("passwordHash");
    });

    it("rejects an unknown email with UnauthorizedException", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.signAsync).not.toHaveBeenCalled();
    });

    it("rejects a wrong password with UnauthorizedException", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue(player);
      mocks.verify.mockResolvedValue(false);
      const service = createService(mocks);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mocks.signAsync).not.toHaveBeenCalled();
    });

    it("rejects a player without a stored password hash", async () => {
      const mocks = createMocks();
      mocks.findByEmail.mockResolvedValue({ ...player, passwordHash: null });
      const service = createService(mocks);

      await expect(service.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.signAsync).not.toHaveBeenCalled();
    });
  });

  describe("me", () => {
    it("returns the database-backed profile with completed missions count", async () => {
      const mocks = createMocks();
      mocks.findById.mockResolvedValue({ ...player, points: 250 });
      mocks.countCompletedMissions.mockResolvedValue(3);
      const service = createService(mocks);

      const result = await service.me(player.id);

      expect(mocks.findById).toHaveBeenCalledWith(player.id);
      expect(mocks.countCompletedMissions).toHaveBeenCalledWith(player.id);
      expect(result).toEqual({
        ...playerProfile,
        points: 250,
        completedMissions: 3,
      });
    });

    it("throws UnauthorizedException when the player does not exist", async () => {
      const mocks = createMocks();
      mocks.findById.mockResolvedValue(null);
      const service = createService(mocks);

      await expect(service.me(player.id)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

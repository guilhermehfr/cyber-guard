import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import { describe, expect, it, vi } from "vitest";

import { RankingController } from "./ranking.controller.js";
import type { RankingService } from "./ranking.service.js";

function createController() {
  const getTopPlayers = vi.fn().mockResolvedValue({ entries: [], currentPlayer: null });
  const rankingService = { getTopPlayers } as unknown as RankingService;

  const verifyAsync = vi.fn();
  const jwtService = { verifyAsync } as unknown as JwtService;

  const getOrThrow = vi.fn().mockReturnValue("cyberguard.session");
  const configService = { getOrThrow } as unknown as ConfigService;

  const controller = new RankingController(rankingService, jwtService, configService);

  return { controller, getTopPlayers, verifyAsync };
}

describe("RankingController", () => {
  it("resolves the player id from the session cookie when present", async () => {
    const { controller, getTopPlayers, verifyAsync } = createController();
    verifyAsync.mockResolvedValue({ sub: "player-1" });

    await controller.getRanking({
      headers: {},
      cookies: { "cyberguard.session": "cookie-token" },
    });

    expect(verifyAsync).toHaveBeenCalledWith("cookie-token");
    expect(getTopPlayers).toHaveBeenCalledWith("player-1");
  });

  it("falls back to the Authorization bearer header when no session cookie is present", async () => {
    const { controller, getTopPlayers, verifyAsync } = createController();
    verifyAsync.mockResolvedValue({ sub: "player-2" });

    await controller.getRanking({
      headers: { authorization: "Bearer header-token" },
      cookies: {},
    });

    expect(verifyAsync).toHaveBeenCalledWith("header-token");
    expect(getTopPlayers).toHaveBeenCalledWith("player-2");
  });

  it("resolves a null player id when neither the cookie nor the header is present", async () => {
    const { controller, getTopPlayers, verifyAsync } = createController();

    await controller.getRanking({ headers: {}, cookies: {} });

    expect(verifyAsync).not.toHaveBeenCalled();
    expect(getTopPlayers).toHaveBeenCalledWith(null);
  });

  it("resolves a null player id when token verification fails", async () => {
    const { controller, getTopPlayers, verifyAsync } = createController();
    verifyAsync.mockRejectedValue(new Error("invalid token"));

    await controller.getRanking({
      headers: {},
      cookies: { "cyberguard.session": "expired-token" },
    });

    expect(getTopPlayers).toHaveBeenCalledWith(null);
  });
});

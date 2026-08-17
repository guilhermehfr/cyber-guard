import type { ConfigService } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";

import { JwtStrategy } from "./jwt.strategy.js";

function createStrategy() {
  const getOrThrow = vi.fn();
  const configService = { getOrThrow } as unknown as ConfigService;
  getOrThrow.mockImplementation((key: string) => {
    if (key === "auth.cookie.name") {
      return "cyberguard.session";
    }
    if (key === "jwt.secret") {
      return "a-very-long-jwt-secret-used-for-testing-only";
    }
    throw new Error(`Unexpected config key: ${key}`);
  });

  const strategy = new JwtStrategy(configService);
  const extractor = (strategy as unknown as { _jwtFromRequest: (req: unknown) => string | null })
    ._jwtFromRequest;

  return { strategy, extractor };
}

describe("JwtStrategy", () => {
  it("extracts the token from the cyberguard.session cookie when present", () => {
    const { extractor } = createStrategy();
    const request = {
      cookies: { "cyberguard.session": "cookie-token" },
      headers: { authorization: "Bearer header-token" },
    };

    expect(extractor(request)).toBe("cookie-token");
  });

  it("falls back to the Authorization bearer header when no session cookie is present", () => {
    const { extractor } = createStrategy();
    const request = {
      cookies: {},
      headers: { authorization: "Bearer header-token" },
    };

    expect(extractor(request)).toBe("header-token");
  });

  it("returns null when neither the cookie nor the bearer header is present", () => {
    const { extractor } = createStrategy();
    const request = { cookies: {}, headers: {} };

    expect(extractor(request)).toBeNull();
  });

  it("maps a JWT payload to an authenticated user", () => {
    const { strategy } = createStrategy();

    const result = strategy.validate({
      sub: "player-1",
      email: "ada@example.com",
      name: "Ada",
    });

    expect(result).toEqual({ id: "player-1", email: "ada@example.com", name: "Ada" });
  });
});

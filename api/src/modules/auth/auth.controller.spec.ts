import type { PlayerProfile } from "@cyber/contracts";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import { describe, expect, it, vi } from "vitest";

import {
  type AuthCallbackReply,
  AuthController,
  type AuthCookieReply,
  type GoogleAuthRedirectReply,
} from "./auth.controller.js";
import type { AuthService } from "./auth.service.js";
import type { OAuthStateStore } from "./oauth-state.store.js";
import type { GoogleStrategy } from "./strategies/google.strategy.js";

const playerProfile: PlayerProfile = {
  id: "cltest0000000000000001",
  name: "Ada",
  email: "ada@example.com",
  points: 0,
  completedMissions: 0,
};

const cookieConfig = {
  name: "cyberguard.session",
  markerName: "cyberguard.auth",
  secure: false,
  sameSite: "lax",
};

const productionCookieConfig = {
  name: "cyberguard.session",
  markerName: "cyberguard.auth",
  secure: true,
  sameSite: "none",
};

function createController(cookie: typeof cookieConfig = cookieConfig) {
  const login = vi.fn();
  const register = vi.fn();
  const me = vi.fn();
  const authService = {
    login,
    register,
    me,
  } as unknown as AuthService;

  const getOrThrow = vi.fn();
  const configService = { getOrThrow } as unknown as ConfigService;
  getOrThrow.mockImplementation((key: string) => {
    if (key === "auth.cookie") {
      return cookie;
    }
    if (key === "app.webUrl") {
      return ["http://localhost:3001"];
    }
    throw new Error(`Unexpected config key: ${key}`);
  });

  const decode = vi.fn();
  const jwtService = { decode } as unknown as JwtService;
  decode.mockReturnValue({ exp: 2_000_000_000 });

  const setCookie = vi.fn();
  const clearCookie = vi.fn();
  const reply = { setCookie, clearCookie } as unknown as AuthCookieReply;

  const createState = vi.fn();
  const oauthStateStore = { createState } as unknown as OAuthStateStore;
  const getAuthorizeUrl = vi.fn();
  const googleStrategy = { getAuthorizeUrl } as unknown as GoogleStrategy;

  const controller = new AuthController(
    authService,
    configService,
    jwtService,
    oauthStateStore,
    googleStrategy,
  );
  return {
    controller,
    login,
    register,
    me,
    setCookie,
    clearCookie,
    reply,
    createState,
    oauthStateStore,
    getAuthorizeUrl,
    googleStrategy,
  };
}

describe("AuthController", () => {
  describe("login", () => {
    it("sets an HttpOnly session cookie and a non-HttpOnly marker cookie, and returns the player", async () => {
      const { controller, login, setCookie, reply } = createController();
      login.mockResolvedValue({ accessToken: "signed-token", player: playerProfile });
      const dto = { email: "ada@example.com", password: "s3cret-password" };

      const result = await controller.login(dto, reply);

      expect(login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ player: playerProfile });
      expect(result).not.toHaveProperty("accessToken");

      expect(setCookie).toHaveBeenCalledTimes(2);
      const [sessionCall, markerCall] = setCookie.mock.calls;
      expect(sessionCall[0]).toBe("cyberguard.session");
      expect(sessionCall[1]).toBe("signed-token");
      expect(sessionCall[2]).toMatchObject({
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      expect(markerCall[0]).toBe("cyberguard.auth");
      expect(markerCall[1]).toBe("1");
      expect(markerCall[2]).toMatchObject({
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "lax",
      });
    });

    it("derives the cookie maxAge from the JWT expiration", async () => {
      const { controller, login, setCookie, reply } = createController();
      login.mockResolvedValue({ accessToken: "signed-token", player: playerProfile });
      const dto = { email: "ada@example.com", password: "s3cret-password" };

      await controller.login(dto, reply);

      const maxAge = setCookie.mock.calls[0]?.[2]?.maxAge as number;
      expect(maxAge).toBe(2_000_000_000 - Math.floor(Date.now() / 1000));
    });
  });

  describe("register", () => {
    it("sets both auth cookies and returns only the player", async () => {
      const { controller, register, setCookie, reply } = createController();
      register.mockResolvedValue({ accessToken: "signed-token", player: playerProfile });
      const dto = { name: "Ada", email: "ada@example.com", password: "s3cret-password" };

      const result = await controller.register(dto, reply);

      expect(register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ player: playerProfile });
      expect(result).not.toHaveProperty("accessToken");
      expect(setCookie).toHaveBeenCalledTimes(2);
      expect(setCookie.mock.calls[0]?.[0]).toBe("cyberguard.session");
      expect(setCookie.mock.calls[0]?.[2]?.httpOnly).toBe(true);
      expect(setCookie.mock.calls[1]?.[0]).toBe("cyberguard.auth");
      expect(setCookie.mock.calls[1]?.[2]?.httpOnly).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears both auth cookies and returns no body", () => {
      const { controller, clearCookie, reply } = createController();

      const result = controller.logout(reply);

      expect(result).toBeUndefined();
      expect(clearCookie).toHaveBeenCalledTimes(2);
      const clearOptions = { path: "/", secure: false, sameSite: "lax", partitioned: false };
      expect(clearCookie).toHaveBeenCalledWith("cyberguard.session", clearOptions);
      expect(clearCookie).toHaveBeenCalledWith("cyberguard.auth", clearOptions);
    });

    it("clears the cookies with the same attributes used to set them in production", () => {
      const { controller, clearCookie, reply } = createController(productionCookieConfig);

      controller.logout(reply);

      const clearOptions = { path: "/", secure: true, sameSite: "none", partitioned: true };
      expect(clearCookie).toHaveBeenCalledWith("cyberguard.session", clearOptions);
      expect(clearCookie).toHaveBeenCalledWith("cyberguard.auth", clearOptions);
    });
  });

  describe("partitioned cookies", () => {
    it("marks both cookies as partitioned when they are secure and cross-site", async () => {
      const { controller, login, setCookie, reply } = createController(productionCookieConfig);
      login.mockResolvedValue({ accessToken: "signed-token", player: playerProfile });

      await controller.login({ email: "ada@example.com", password: "s3cret-password" }, reply);

      const [sessionCall, markerCall] = setCookie.mock.calls;
      expect(sessionCall[2]).toMatchObject({
        secure: true,
        sameSite: "none",
        partitioned: true,
        httpOnly: true,
      });
      expect(markerCall[2]).toMatchObject({
        secure: true,
        sameSite: "none",
        partitioned: true,
        httpOnly: false,
      });
    });

    it("does not partition the cookies in a same-site development setup", async () => {
      const { controller, login, setCookie, reply } = createController();
      login.mockResolvedValue({ accessToken: "signed-token", player: playerProfile });

      await controller.login({ email: "ada@example.com", password: "s3cret-password" }, reply);

      expect(setCookie.mock.calls[0]?.[2]?.partitioned).toBe(false);
      expect(setCookie.mock.calls[1]?.[2]?.partitioned).toBe(false);
    });
  });

  describe("googleAuth", () => {
    it("redirects to the Google authorization URL carrying a stored state", () => {
      const { controller, createState, getAuthorizeUrl } = createController();
      const redirect = vi.fn().mockReturnValue("redirect-result");
      const code = vi.fn();
      const state = "fresh-state";
      createState.mockReturnValue(state);
      getAuthorizeUrl.mockReturnValue(
        "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&state=fresh-state",
      );
      const redirectReply = { code, redirect } as unknown as GoogleAuthRedirectReply;
      code.mockReturnValue(redirectReply);

      const result = controller.googleAuth(redirectReply);

      expect(createState).toHaveBeenCalledTimes(1);
      expect(getAuthorizeUrl).toHaveBeenCalledWith(state);
      expect(code).toHaveBeenCalledWith(302);
      expect(redirect).toHaveBeenCalledWith(
        "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&state=fresh-state",
      );
      expect(result).toBeUndefined();
    });
  });

  describe("googleCallback", () => {
    it("sets both auth cookies and redirects to the web play page", () => {
      const { controller, setCookie, reply } = createController();
      const redirect = vi.fn().mockReturnValue("redirect-result");
      const callbackReply = {
        ...reply,
        redirect,
      } as unknown as AuthCallbackReply;
      const request = {
        user: { accessToken: "signed-token", player: playerProfile },
      };

      const result = controller.googleCallback(request, callbackReply);

      expect(redirect).toHaveBeenCalledWith("http://localhost:3001/play", 302);
      expect(result).toBe("redirect-result");
      expect(setCookie).toHaveBeenCalledTimes(2);
      expect(setCookie.mock.calls[0]?.[1]).toBe("signed-token");
      expect(setCookie.mock.calls[0]?.[2]?.httpOnly).toBe(true);
    });
  });
});

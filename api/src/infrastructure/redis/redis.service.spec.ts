import type { ConfigService } from "@nestjs/config";
import type Redis from "ioredis";
import { describe, expect, it, vi } from "vitest";

import { RedisService } from "./redis.service.js";

function createClientMock() {
  return {
    connect: vi.fn().mockResolvedValue("OK"),
    quit: vi.fn().mockResolvedValue("OK"),
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  };
}

function createConfigStub(ttlSeconds: number) {
  return {
    getOrThrow: vi.fn().mockReturnValue({ url: "redis://localhost:6379", ttlSeconds }),
  };
}

function createService(mocks: ReturnType<typeof createClientMock>, ttlSeconds = 600): RedisService {
  return new RedisService(
    mocks as unknown as Redis,
    createConfigStub(ttlSeconds) as unknown as ConfigService,
  );
}

describe("RedisService", () => {
  it("sets and retrieves a value", async () => {
    const mocks = createClientMock();
    mocks.get.mockResolvedValue("mission-state");
    const service = createService(mocks);

    await service.set("session:1", "mission-state");

    expect(mocks.set).toHaveBeenCalledWith("session:1", "mission-state", "EX", 600);
    await expect(service.get("session:1")).resolves.toBe("mission-state");
    expect(mocks.get).toHaveBeenCalledWith("session:1");
  });

  it("applies the configured default ttl and honors an explicit ttl", async () => {
    const mocks = createClientMock();
    const service = createService(mocks, 600);

    await service.set("session:1", "value");
    expect(mocks.set).toHaveBeenLastCalledWith("session:1", "value", "EX", 600);

    await service.set("session:1", "value", 120);
    expect(mocks.set).toHaveBeenLastCalledWith("session:1", "value", "EX", 120);
  });

  it("deletes a value", async () => {
    const mocks = createClientMock();
    const service = createService(mocks);

    await service.delete("session:1");

    expect(mocks.del).toHaveBeenCalledWith("session:1");
  });

  it("connects on init and closes on destroy", async () => {
    const mocks = createClientMock();
    const service = createService(mocks);

    await service.onModuleInit();
    expect(mocks.connect).toHaveBeenCalledOnce();

    await service.onModuleDestroy();
    expect(mocks.quit).toHaveBeenCalledOnce();
  });
});

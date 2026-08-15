import { describe, expect, it, vi } from "vitest";

import type { PrismaService } from "@/infrastructure/database/prisma.service.js";

import { RankingService } from "./ranking.service.js";

function playerRow(id: string, name: string, points: number, createdAt: string) {
  return {
    id,
    name,
    email: `${id}@example.com`,
    passwordHash: `hash-${id}`,
    points,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
  };
}

function createMocks() {
  const findMany = vi.fn();
  const findUnique = vi.fn();
  const count = vi.fn();
  const playerModel = { findMany, findUnique, count };
  const prisma = { player: playerModel } as unknown as PrismaService;
  return { prisma, playerModel, findMany, findUnique, count };
}

function createService(mocks: ReturnType<typeof createMocks>): RankingService {
  return new RankingService(mocks.prisma);
}

describe("RankingService", () => {
  it("orders players by points descending and limits the query to ten", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([
      playerRow("p1", "Ada", 300, "2026-08-01T00:00:00.000Z"),
      playerRow("p2", "Grace", 200, "2026-08-02T00:00:00.000Z"),
      playerRow("p3", "Linus", 150, "2026-08-03T00:00:00.000Z"),
    ]);
    const service = createService(mocks);

    const result = await service.getTopPlayers();

    expect(mocks.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, points: true },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }, { id: "asc" }],
      take: 10,
    });
    expect(result.entries.map((entry) => entry.points)).toEqual([300, 200, 150]);
  });

  it("returns only the top ten players with positions starting at one", async () => {
    const mocks = createMocks();
    const rows = Array.from({ length: 10 }, (_, index) =>
      playerRow(`p${index}`, `Player ${index}`, 100 - index, "2026-08-01T00:00:00.000Z"),
    );
    mocks.findMany.mockResolvedValue(rows);
    const service = createService(mocks);

    const result = await service.getTopPlayers();

    expect(result.entries).toHaveLength(10);
    expect(result.entries[0]).toEqual({ position: 1, id: "p0", name: "Player 0", points: 100 });
    expect(result.entries[9]).toEqual({ position: 10, id: "p9", name: "Player 9", points: 91 });
  });

  it("excludes sensitive player fields from the response", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([
      playerRow("p1", "Ada", 300, "2026-08-01T00:00:00.000Z"),
      playerRow("p2", "Grace", 200, "2026-08-02T00:00:00.000Z"),
    ]);
    const service = createService(mocks);

    const result = await service.getTopPlayers();

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, name: true, points: true } }),
    );
    expect(result.entries).toEqual([
      { position: 1, id: "p1", name: "Ada", points: 300 },
      { position: 2, id: "p2", name: "Grace", points: 200 },
    ]);
    expect(JSON.stringify(result)).not.toContain("@example.com");
    expect(JSON.stringify(result)).not.toContain("hash-");
  });

  it("orders players with equal points deterministically", async () => {
    const mocks = createMocks();
    const older = playerRow("p-old", "Older", 100, "2026-08-01T00:00:00.000Z");
    const newer = playerRow("p-new", "Newer", 100, "2026-08-02T00:00:00.000Z");
    mocks.findMany.mockResolvedValue([older, newer]);
    const service = createService(mocks);

    const result = await service.getTopPlayers();

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ points: "desc" }, { createdAt: "asc" }, { id: "asc" }],
      }),
    );
    expect(result.entries.map((entry) => entry.id)).toEqual(["p-old", "p-new"]);
  });

  it("returns currentPlayer null when no player id is provided", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([]);
    const service = createService(mocks);

    const result = await service.getTopPlayers();

    expect(result.currentPlayer).toBeNull();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("returns the authenticated player inside the top ten", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([
      playerRow("p1", "Ada", 300, "2026-08-01T00:00:00.000Z"),
      playerRow("p2", "Grace", 200, "2026-08-02T00:00:00.000Z"),
    ]);
    mocks.findUnique.mockResolvedValue({
      id: "p2",
      points: 200,
      createdAt: new Date("2026-08-02T00:00:00.000Z"),
    });
    mocks.count.mockResolvedValue(1);
    const service = createService(mocks);

    const result = await service.getTopPlayers("p2");

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: "p2" },
      select: { id: true, points: true, createdAt: true },
    });
    expect(mocks.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { points: { gt: 200 } },
          { points: 200, createdAt: { lt: new Date("2026-08-02T00:00:00.000Z") } },
          { points: 200, createdAt: new Date("2026-08-02T00:00:00.000Z"), id: { lt: "p2" } },
        ],
      },
    });
    expect(result.currentPlayer).toEqual({ position: 2, id: "p2", points: 200 });
  });

  it("computes the correct position when the player is outside the top ten", async () => {
    const mocks = createMocks();
    const rows = Array.from({ length: 10 }, (_, index) =>
      playerRow(`p${index}`, `Player ${index}`, 100 - index, "2026-08-01T00:00:00.000Z"),
    );
    mocks.findMany.mockResolvedValue(rows);
    mocks.findUnique.mockResolvedValue({
      id: "p27",
      points: 40,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
    });
    mocks.count.mockResolvedValue(26);
    const service = createService(mocks);

    const result = await service.getTopPlayers("p27");

    expect(result.entries).toHaveLength(10);
    expect(result.entries.some((entry) => entry.id === "p27")).toBe(false);
    expect(result.currentPlayer).toEqual({ position: 27, id: "p27", points: 40 });
  });

  it("counts players ahead with equal points using the deterministic tie-break", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([]);
    mocks.findUnique.mockResolvedValue({
      id: "p-b",
      points: 100,
      createdAt: new Date("2026-08-02T00:00:00.000Z"),
    });
    mocks.count.mockResolvedValue(1);
    const service = createService(mocks);

    const result = await service.getTopPlayers("p-b");

    expect(result.currentPlayer).toEqual({ position: 2, id: "p-b", points: 100 });
  });

  it("returns currentPlayer null when the player id does not exist", async () => {
    const mocks = createMocks();
    mocks.findMany.mockResolvedValue([]);
    mocks.findUnique.mockResolvedValue(null);
    const service = createService(mocks);

    const result = await service.getTopPlayers("missing");

    expect(result.currentPlayer).toBeNull();
    expect(mocks.count).not.toHaveBeenCalled();
  });
});

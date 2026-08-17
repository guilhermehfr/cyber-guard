import type { RealtimeEvent } from "@cyber/contracts";
import { describe, expect, it, vi } from "vitest";

import { RealtimeGateway } from "./realtime.gateway.js";

const OPEN = 1;
const CLOSED = 3;

function createGatewayWithClient() {
  const send = vi.fn();
  const gateway = new RealtimeGateway();
  gateway.server = { clients: new Set([{ readyState: OPEN, send }]) } as never;
  return { gateway, send };
}

describe("RealtimeGateway", () => {
  it("broadcasts a ranking.updated event with an ISO updatedAt", () => {
    const { gateway, send } = createGatewayWithClient();

    gateway.emitRankingUpdated(new Date("2026-08-14T12:00:00.000Z"));

    expect(send).toHaveBeenCalledOnce();
    const payload = JSON.parse(send.mock.calls[0][0]) as RealtimeEvent;
    expect(payload).toEqual({
      event: "ranking.updated",
      data: { updatedAt: "2026-08-14T12:00:00.000Z" },
    });
  });

  it("broadcasts a player.score.updated event with the player id and points", () => {
    const { gateway, send } = createGatewayWithClient();

    gateway.emitPlayerScoreUpdated("player-1", 150);

    expect(send).toHaveBeenCalledOnce();
    const payload = JSON.parse(send.mock.calls[0][0]) as RealtimeEvent;
    expect(payload).toEqual({
      event: "player.score.updated",
      data: { playerId: "player-1", points: 150 },
    });
  });

  it("skips clients that are not open", () => {
    const send = vi.fn();
    const gateway = new RealtimeGateway();
    gateway.server = { clients: new Set([{ readyState: CLOSED, send }]) } as never;

    gateway.emitRankingUpdated();

    expect(send).not.toHaveBeenCalled();
  });

  it("does not send sensitive fields in the payload", () => {
    const { gateway, send } = createGatewayWithClient();

    gateway.emitPlayerScoreUpdated("player-1", 150);

    const serialized = send.mock.calls[0][0] as string;
    expect(serialized).not.toMatch(/password|token|hash|email/i);
  });

  it("is safe to emit when no clients are connected", () => {
    const gateway = new RealtimeGateway();
    gateway.server = { clients: new Set() } as never;

    expect(() => gateway.emitRankingUpdated()).not.toThrow();
  });
});

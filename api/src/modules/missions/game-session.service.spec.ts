import { describe, expect, it, vi } from "vitest";

import type { RedisService } from "@/infrastructure/redis/redis.service.js";

import { type GameSession, GameSessionService } from "./game-session.service.js";

const sampleSession: GameSession = {
  sessionId: "session-1",
  playerId: "player-1",
  missionId: "mission-1",
  questions: [
    {
      questionId: "question-1",
      answerIds: ["answer-1", "answer-2"],
      correctAnswerIds: ["answer-1"],
    },
  ],
  answers: [],
};

function createMocks() {
  const get = vi.fn();
  const set = vi.fn();
  const redis = { get, set, delete: vi.fn() } as unknown as RedisService;
  const service = new GameSessionService(redis);
  return { get, set, service };
}

describe("GameSessionService", () => {
  it("stores the session with the correct answer ids under a prefixed key and returns the session id", async () => {
    const { set, service } = createMocks();

    const sessionId = await service.create({
      playerId: "player-1",
      missionId: "mission-1",
      questions: sampleSession.questions,
    });

    expect(set).toHaveBeenCalledWith(expect.stringMatching(/^game-session:/), expect.any(String));
    const key = set.mock.calls[0][0];
    const stored = JSON.parse(set.mock.calls[0][1]);
    expect(stored).toEqual({
      sessionId,
      playerId: "player-1",
      missionId: "mission-1",
      questions: sampleSession.questions,
      answers: [],
    });
    expect(key).toBe(`game-session:${sessionId}`);
  });

  it("returns the parsed session, or null when the stored value is missing or corrupt", async () => {
    const { get, service } = createMocks();
    get.mockResolvedValue(JSON.stringify(sampleSession));
    await expect(service.get("session-1")).resolves.toEqual(sampleSession);

    get.mockResolvedValue(null);
    await expect(service.get("session-1")).resolves.toBeNull();

    get.mockResolvedValue('{"not":"a session"}');
    await expect(service.get("session-1")).resolves.toBeNull();

    get.mockResolvedValue("{oops");
    await expect(service.get("session-1")).resolves.toBeNull();
  });
});

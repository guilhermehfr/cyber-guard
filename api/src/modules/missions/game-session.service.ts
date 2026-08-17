import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { RedisService } from "@/infrastructure/redis/redis.service.js";

const SESSION_KEY_PREFIX = "game-session:";

export interface GameSessionQuestion {
  questionId: string;
  answerIds: string[];
  correctAnswerIds: string[];
}

export interface GameSessionAnswer {
  questionId: string;
  answerId: string;
}

export interface GameSession {
  sessionId: string;
  playerId: string;
  missionId: string;
  questions: GameSessionQuestion[];
  answers: GameSessionAnswer[];
}

@Injectable()
export class GameSessionService {
  constructor(private readonly redis: RedisService) {}

  async create(data: {
    playerId: string;
    missionId: string;
    questions: GameSessionQuestion[];
  }): Promise<string> {
    const sessionId = randomUUID();
    const session: GameSession = {
      sessionId,
      playerId: data.playerId,
      missionId: data.missionId,
      questions: data.questions,
      answers: [],
    };
    await this.redis.set(this.toKey(sessionId), JSON.stringify(session));
    return sessionId;
  }

  async get(sessionId: string): Promise<GameSession | null> {
    const raw = await this.redis.get(this.toKey(sessionId));
    if (!raw) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return this.isGameSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(session: GameSession): Promise<void> {
    await this.redis.set(this.toKey(session.sessionId), JSON.stringify(session));
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.delete(this.toKey(sessionId));
  }

  private toKey(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }

  private isGameSession(value: unknown): value is GameSession {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const candidate = value as Partial<GameSession>;
    return (
      typeof candidate.sessionId === "string" &&
      typeof candidate.playerId === "string" &&
      typeof candidate.missionId === "string" &&
      Array.isArray(candidate.questions) &&
      Array.isArray(candidate.answers)
    );
  }
}

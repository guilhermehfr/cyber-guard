import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

type StateStoreStoreCallback = (err: Error | null, state: string) => void;
type StateStoreVerifyCallback = (err: Error | null, ok: boolean, state: string) => void;

interface StateStoreShape {
  store(req: unknown, callback: StateStoreStoreCallback): void;
  store(req: unknown, meta: unknown, callback: StateStoreStoreCallback): void;
  verify(req: unknown, state: string, callback: StateStoreVerifyCallback): void;
  verify(req: unknown, state: string, meta: unknown, callback: StateStoreVerifyCallback): void;
}

const STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OAuthStateStore implements StateStoreShape {
  private readonly states = new Map<string, number>();

  createState(): string {
    const state = randomUUID();
    this.states.set(state, Date.now() + STATE_TTL_MS);
    return state;
  }

  consumeState(state: string): boolean {
    const expiresAt = this.states.get(state);
    this.states.delete(state);
    return expiresAt !== undefined && expiresAt > Date.now();
  }

  store(_req: unknown, callback: StateStoreStoreCallback): void;
  store(_req: unknown, meta: unknown, callback: StateStoreStoreCallback): void;
  store(
    _req: unknown,
    metaOrCallback: unknown | StateStoreStoreCallback,
    callback?: StateStoreStoreCallback,
  ): void {
    const done = typeof metaOrCallback === "function" ? metaOrCallback : callback;
    if (done === undefined) {
      return;
    }
    done(null, this.createState());
  }

  verify(_req: unknown, state: string, callback: StateStoreVerifyCallback): void;
  verify(_req: unknown, state: string, meta: unknown, callback: StateStoreVerifyCallback): void;
  verify(
    _req: unknown,
    state: string,
    metaOrCallback: unknown | StateStoreVerifyCallback,
    callback?: StateStoreVerifyCallback,
  ): void {
    const done = typeof metaOrCallback === "function" ? metaOrCallback : callback;
    if (done === undefined) {
      return;
    }
    done(null, this.consumeState(state), state);
  }
}

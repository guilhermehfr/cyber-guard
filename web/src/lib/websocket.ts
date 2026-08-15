import type { RealtimeEvent } from "@cyber/contracts";

type RealtimeListener = (event: RealtimeEvent) => void;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function realtimeUrl(): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return `${API_URL.replace(/^http/, "ws")}/realtime`;
}

function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const event = value as { event?: unknown; data?: unknown };
  return typeof event.event === "string" && typeof event.data === "object" && event.data !== null;
}

export class RealtimeClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<RealtimeListener>();

  connect(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const socket = new WebSocket(realtimeUrl());
    socket.onmessage = (message) => this.handleMessage(message.data);
    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }
    };
    this.socket = socket;
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }

  onEvent(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleMessage(data: unknown): void {
    if (typeof data !== "string") {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }

    if (!isRealtimeEvent(parsed)) {
      return;
    }

    for (const listener of this.listeners) {
      listener(parsed);
    }
  }
}

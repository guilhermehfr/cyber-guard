import type { RealtimeEvent } from "@cyber/contracts";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { WebSocket, type WebSocketServer as WsServer } from "ws";

@WebSocketGateway({ path: "/realtime" })
export class RealtimeGateway {
  @WebSocketServer()
  server!: WsServer;

  emitRankingUpdated(updatedAt: Date = new Date()): void {
    this.emit({ event: "ranking.updated", data: { updatedAt: updatedAt.toISOString() } });
  }

  emitPlayerScoreUpdated(playerId: string, points: number): void {
    this.emit({ event: "player.score.updated", data: { playerId, points } });
  }

  private emit(event: RealtimeEvent): void {
    const payload = JSON.stringify(event);
    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}

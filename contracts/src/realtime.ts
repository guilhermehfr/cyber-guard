export interface RankingUpdatedEvent {
  updatedAt: string;
}

export interface PlayerScoreUpdatedEvent {
  playerId: string;
  points: number;
}

export interface RealtimeEventMap {
  "ranking.updated": RankingUpdatedEvent;
  "player.score.updated": PlayerScoreUpdatedEvent;
}

export type RealtimeEventName = keyof RealtimeEventMap;

export type RealtimeEvent = {
  [K in RealtimeEventName]: { event: K; data: RealtimeEventMap[K] };
}[RealtimeEventName];
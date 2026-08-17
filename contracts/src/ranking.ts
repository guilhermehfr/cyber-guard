export interface RankingEntry {
  position: number;
  id: string;
  name: string;
  points: number;
}

export interface RankingCurrentPlayer {
  position: number;
  id: string;
  points: number;
}

export interface RankingResponse {
  entries: RankingEntry[];
  currentPlayer: RankingCurrentPlayer | null;
}
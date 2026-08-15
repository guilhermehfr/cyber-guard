export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionCompletion {
  id: string;
  missionId: string;
  completedAt: string;
}

export interface CompleteMissionResponse {
  completion: MissionCompletion;
  pointsAwarded: number;
  playerPoints: number;
}
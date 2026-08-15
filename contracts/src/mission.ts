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

export interface MissionAnswer {
  id: string;
  text: string;
}

export interface MissionQuestion {
  id: string;
  prompt: string;
  answers: MissionAnswer[];
}

export interface MissionQuestionsResponse {
  missionId: string;
  questions: MissionQuestion[];
}

export interface CompleteMissionRequest {
  answers: Array<{
    questionId: string;
    answerId: string;
  }>;
}

export interface CompleteMissionResponse {
  completion: MissionCompletion;
  correctCount: number;
  totalQuestions: number;
  pointsAwarded: number;
  playerPoints: number;
}

export interface CompletedMissionIdsResponse {
  missionIds: string[];
}
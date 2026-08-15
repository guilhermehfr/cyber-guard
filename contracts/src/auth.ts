export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  completedMissions: number;
}

export interface AuthResponse {
  accessToken: string;
  player: PlayerProfile;
}
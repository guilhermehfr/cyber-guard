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
  player: PlayerProfile;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}
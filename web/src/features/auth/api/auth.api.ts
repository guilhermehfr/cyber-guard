import type { AuthResponse, LoginRequest, PlayerProfile, RegisterRequest } from "@cyber/contracts";

import { api } from "@/lib/api/api";

export interface AuthApi {
  register(payload: RegisterRequest): Promise<AuthResponse>;
  login(payload: LoginRequest): Promise<AuthResponse>;
  me(): Promise<PlayerProfile>;
}

export const authApi: AuthApi = {
  register(payload: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/register", payload);
  },

  login(payload: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/login", payload);
  },

  me(): Promise<PlayerProfile> {
    return api.get<PlayerProfile>("/auth/me");
  },
};

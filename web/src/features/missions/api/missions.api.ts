import type {
  CompletedMissionIdsResponse,
  CompleteMissionRequest,
  CompleteMissionResponse,
  Mission,
  StartMissionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "@/features/missions/types";

import { api } from "@/lib/api/api";

export const missionsApi = {
  list(): Promise<Mission[]> {
    return api.get<Mission[]>("/missions");
  },

  completed(): Promise<CompletedMissionIdsResponse> {
    return api.get<CompletedMissionIdsResponse>("/missions/completed");
  },

  start(missionId: string): Promise<StartMissionResponse> {
    return api.post<StartMissionResponse>(`/missions/${missionId}/start`);
  },

  answer(missionId: string, payload: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    return api.post<SubmitAnswerResponse>(`/missions/${missionId}/answer`, payload);
  },

  complete(missionId: string, payload: CompleteMissionRequest): Promise<CompleteMissionResponse> {
    return api.post<CompleteMissionResponse>(`/missions/${missionId}/complete`, payload);
  },
};

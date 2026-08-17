import type { RankingResponse } from "@/features/ranking/types";

import { api } from "@/lib/api/api";

export const rankingApi = {
  getRanking(): Promise<RankingResponse> {
    return api.get<RankingResponse>("/ranking");
  },
};

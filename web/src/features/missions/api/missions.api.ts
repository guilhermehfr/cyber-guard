import type { Mission } from "@/features/missions/types";

import { api } from "@/lib/api/api";

export const missionsApi = {
  list(): Promise<Mission[]> {
    return api.get<Mission[]>("/missions");
  },
};

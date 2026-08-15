import { useCallback, useEffect, useMemo, useState } from "react";

import { missionsApi } from "@/features/missions/api/missions.api";
import type { Difficulty, Mission } from "@/features/missions/types";

export type MissionsStatus = "loading" | "error" | "success";

export interface UseMissionsResult {
  status: MissionsStatus;
  byDifficulty: Record<Difficulty, Mission[]>;
  retry: () => void;
}

export function useMissions(): UseMissionsResult {
  const [status, setStatus] = useState<MissionsStatus>("loading");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    void reloadKey;
    let active = true;
    setStatus("loading");

    void missionsApi
      .list()
      .then((data) => {
        if (active) {
          setMissions(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const byDifficulty = useMemo<Record<Difficulty, Mission[]>>(() => {
    const grouped: Record<Difficulty, Mission[]> = { EASY: [], MEDIUM: [], HARD: [] };
    for (const mission of missions) {
      grouped[mission.difficulty].push(mission);
    }
    return grouped;
  }, [missions]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { status, byDifficulty, retry };
}

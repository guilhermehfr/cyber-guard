import type { RankingEntry } from "@/features/ranking/types";

import { RankingEntry as RankingRow } from "./ranking-entry";

interface RankingListProps {
  entries: RankingEntry[];
  currentPlayerId?: string | null;
}

export function RankingList({ entries, currentPlayerId }: RankingListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {entries.map((entry) => (
        <RankingRow key={entry.id} entry={entry} isCurrent={entry.id === currentPlayerId} />
      ))}
    </ul>
  );
}

import type { RankingEntry as RankingEntryType } from "@/features/ranking/types";

interface RankingEntryProps {
  entry: RankingEntryType;
  isCurrent?: boolean;
}

export function RankingEntry({ entry, isCurrent = false }: RankingEntryProps) {
  return (
    <li
      aria-current={isCurrent ? "true" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 focus-within:bg-muted/50 ${
        isCurrent ? "border border-primary/40 bg-primary/10" : ""
      }`}
    >
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          entry.position === 1 ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
        }`}
        aria-hidden="true"
      >
        {entry.position}
      </span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">{entry.name}</span>
      {isCurrent && (
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          Você
        </span>
      )}
      <span className="text-sm font-semibold tabular-nums text-muted-foreground">
        {entry.points} pts
      </span>
    </li>
  );
}

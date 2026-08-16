import type { RankingEntry as RankingEntryType } from "@/features/ranking/types";

interface RankingEntryProps {
  entry: RankingEntryType;
  isCurrent?: boolean;
  anchor?: boolean;
}

export function RankingEntry({ entry, isCurrent = false, anchor = false }: RankingEntryProps) {
  return (
    <li
      aria-current={isCurrent ? "true" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 focus-within:bg-muted/50 ${
        anchor
          ? "border border-primary/40 bg-primary/10"
          : isCurrent
            ? "border border-border bg-muted/60"
            : ""
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
      <span className="flex-1 truncate text-sm font-medium text-foreground">
        {anchor ? "Você" : isCurrent ? "Sua posição" : entry.name}
      </span>
      <span className="text-sm font-semibold tabular-nums text-muted-foreground">
        {entry.points} pts
      </span>
    </li>
  );
}

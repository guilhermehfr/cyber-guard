import { Crown, type LucideIcon, Medal } from "lucide-react";

import type { RankingEntry } from "@/features/ranking/types";

interface RankingPodiumProps {
  entries: RankingEntry[];
  currentPlayerId?: string | null;
}

type Tier = 1 | 2 | 3;

const TIER_CONFIG: Record<
  Tier,
  {
    icon: LucideIcon;
    iconClass: string;
    avatarClass: string;
    borderClass: string;
    glowClass: string;
    minHeight: string;
  }
> = {
  1: {
    icon: Crown,
    iconClass: "text-warning",
    avatarClass: "bg-warning/15 text-warning",
    borderClass: "border-warning/40",
    glowClass: "shadow-[0_0_28px] shadow-warning/20",
    minHeight: "min-h-[11rem]",
  },
  2: {
    icon: Medal,
    iconClass: "text-muted-foreground",
    avatarClass: "bg-secondary text-secondary-foreground",
    borderClass: "border-border",
    glowClass: "shadow-none",
    minHeight: "min-h-[9.5rem]",
  },
  3: {
    icon: Medal,
    iconClass: "text-accent",
    avatarClass: "bg-accent/15 text-accent",
    borderClass: "border-border",
    glowClass: "shadow-none",
    minHeight: "min-h-[9.5rem]",
  },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function PodiumSlot({
  entry,
  tier,
  isCurrent,
}: {
  entry?: RankingEntry;
  tier: Tier;
  isCurrent: boolean;
}) {
  if (!entry) {
    return null;
  }

  const config = TIER_CONFIG[tier];

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 ${config.borderClass} ${config.glowClass} ${config.minHeight} ${
        isCurrent ? "border-primary/60 ring-1 ring-primary/40" : ""
      }`}
    >
      <config.icon className={`h-6 w-6 ${config.iconClass}`} aria-hidden="true" />
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${config.avatarClass}`}
        aria-hidden="true"
      >
        {initials(entry.name)}
      </span>
      <span className="text-xs font-bold tracking-wider text-muted-foreground">
        #{entry.position}
      </span>
      <span className="w-full truncate text-sm font-semibold text-foreground">{entry.name}</span>
      {isCurrent && (
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          Você
        </span>
      )}
      <span className="text-sm font-bold tabular-nums text-muted-foreground">
        {entry.points} pts
      </span>
    </div>
  );
}

export function RankingPodium({ entries, currentPlayerId }: RankingPodiumProps) {
  return (
    <div className="grid grid-cols-3 items-end gap-3">
      <div className="order-1">
        <PodiumSlot entry={entries[1]} tier={2} isCurrent={entries[1]?.id === currentPlayerId} />
      </div>
      <div className="order-2">
        <PodiumSlot entry={entries[0]} tier={1} isCurrent={entries[0]?.id === currentPlayerId} />
      </div>
      <div className="order-3">
        <PodiumSlot entry={entries[2]} tier={3} isCurrent={entries[2]?.id === currentPlayerId} />
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

export type DifficultyVariant = "easy" | "medium" | "hard";

interface MissionDifficultyCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: DifficultyVariant;
}

const variantStyles: Record<
  DifficultyVariant,
  { border: string; icon: string; badge: string; hover: string }
> = {
  easy: {
    border: "border-success/40 hover:border-success",
    icon: "text-success",
    badge: "bg-success/10 text-success",
    hover: "hover:bg-success/5",
  },
  medium: {
    border: "border-warning/40 hover:border-warning",
    icon: "text-warning",
    badge: "bg-warning/10 text-warning",
    hover: "hover:bg-warning/5",
  },
  hard: {
    border: "border-destructive/40 hover:border-destructive",
    icon: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
    hover: "hover:bg-destructive/5",
  },
};

export function MissionDifficultyCard({
  title,
  description,
  icon: Icon,
  variant,
}: MissionDifficultyCardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      className={`group flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all ${styles.border} ${styles.hover} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
    >
      <span className={`inline-flex rounded-lg p-2.5 ${styles.badge}`} aria-hidden="true">
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-display text-xl font-bold tracking-wide text-foreground">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
      <span
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      >
        Jogar
      </span>
    </button>
  );
}

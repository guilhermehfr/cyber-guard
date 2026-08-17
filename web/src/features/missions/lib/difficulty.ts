import type { Difficulty } from "@cyber/contracts";
import type { LucideIcon } from "lucide-react";
import { Shield, Skull, Swords } from "lucide-react";

export type DifficultyVariant = "easy" | "medium" | "hard";

export interface DifficultyMeta {
  label: string;
  variant: DifficultyVariant;
  description: string;
  icon: LucideIcon;
  accent: string;
  border: string;
  badge: string;
  hover: string;
}

export const DIFFICULTIES: readonly Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export const DIFFICULTY_META: Record<Difficulty, DifficultyMeta> = {
  EASY: {
    label: "FÁCIL",
    variant: "easy",
    description: "Missões de dificuldade fácil",
    icon: Shield,
    accent: "text-success",
    border: "border-success/40",
    badge: "bg-success/10 text-success",
    hover: "hover:bg-success/5",
  },
  MEDIUM: {
    label: "MÉDIO",
    variant: "medium",
    description: "Missões de dificuldade média",
    icon: Swords,
    accent: "text-warning",
    border: "border-warning/40",
    badge: "bg-warning/10 text-warning",
    hover: "hover:bg-warning/5",
  },
  HARD: {
    label: "DIFÍCIL",
    variant: "hard",
    description: "Missões de dificuldade difícil",
    icon: Skull,
    accent: "text-destructive",
    border: "border-destructive/40",
    badge: "bg-destructive/10 text-destructive",
    hover: "hover:bg-destructive/5",
  },
};

export function isDifficulty(value: string | null | undefined): value is Difficulty {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

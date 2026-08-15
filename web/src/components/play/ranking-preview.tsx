"use client";

import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { rankingApi } from "@/features/ranking/api/ranking.api";
import { RankingModal } from "@/features/ranking/components/ranking-modal";
import type { RankingEntry } from "@/features/ranking/types";

type Status = "loading" | "error" | "success";

export function RankingPreview() {
  const [status, setStatus] = useState<Status>("loading");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    void rankingApi
      .getRanking()
      .then((data) => {
        if (active) {
          setEntries(data.entries);
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
  }, []);

  return (
    <section
      aria-labelledby="ranking-heading"
      className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-warning" aria-hidden="true" />
        <h2
          id="ranking-heading"
          className="font-display text-lg font-bold tracking-wide text-foreground"
        >
          Ranking
        </h2>
      </div>

      <div className="mt-4">
        {status === "loading" && (
          <ul className="flex flex-col gap-3">
            {[0, 1, 2].map((item) => (
              <li key={item} className="h-8 animate-pulse rounded-full bg-secondary" />
            ))}
          </ul>
        )}

        {status === "error" && (
          <p className="text-sm text-muted-foreground">Não foi possível carregar o ranking.</p>
        )}

        {status === "success" && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum jogador ainda.</p>
        )}

        {status === "success" && entries.length > 0 && (
          <ul className="flex flex-col gap-3">
            {entries.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    entry.position === 1
                      ? "bg-warning/15 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {entry.position}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-foreground">
                  {entry.name}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {entry.points} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Ver ranking
      </button>

      <RankingModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

"use client";

import { AlertTriangle, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { RankingCurrentPlayer, RankingResponse } from "@/features/ranking/types";

import { rankingApi } from "../api/ranking.api";
import { RankingEntry } from "./ranking-entry";
import { RankingList } from "./ranking-list";
import { RankingPodium } from "./ranking-podium";

interface RankingModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = "loading" | "error" | "success";

function toRankingEntry(currentPlayer: RankingCurrentPlayer) {
  return {
    position: currentPlayer.position,
    id: currentPlayer.id,
    name: "Você",
    points: currentPlayer.points,
  };
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function RankingSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-3" aria-label="Carregando ranking">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className={`animate-pulse rounded-xl bg-secondary ${item === 1 ? "h-44" : "h-36"}`}
          />
        ))}
      </div>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-10 animate-pulse rounded-lg bg-secondary" />
      ))}
      <span className="sr-only">Carregando ranking...</span>
    </div>
  );
}

export function RankingModal({ open, onClose }: RankingModalProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const loadRanking = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await rankingApi.getRanking();
      setRanking(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadRanking();
    }
  }, [open, loadRanking]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0]?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const entries = ranking?.entries ?? [];
  const currentPlayer = ranking?.currentPlayer ?? null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <button
        type="button"
        aria-label="Fechar ranking"
        onClick={onClose}
        className="animate-rank-fade fixed inset-0 bg-black/50"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ranking-modal-title"
        className="animate-rank-slide relative mx-auto mt-4 w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:mt-8"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-gradient-to-b from-primary/15 to-card px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning shadow-[0_0_24px] shadow-warning/20">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="ranking-modal-title"
                className="font-display text-2xl font-bold tracking-widest text-foreground"
              >
                RANKING
              </h2>
              <p className="text-sm text-muted-foreground">Quem está dominando a CyberGuard?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="theme-scroll max-h-[60vh] overflow-y-auto px-6 py-6">
          {status === "loading" && <RankingSkeleton />}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-6 py-8 text-center">
              <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Não foi possível carregar o ranking.</p>
              <button
                type="button"
                onClick={() => void loadRanking()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {status === "success" && entries.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Nenhum jogador ainda. Seja o primeiro a dominar a CyberGuard!
              </p>
            </div>
          )}

          {status === "success" && entries.length > 0 && (
            <div
              className="animate-rank-rise flex flex-col gap-6"
              style={{ animationDelay: "120ms" }}
            >
              <RankingPodium entries={entries.slice(0, 3)} currentPlayerId={currentPlayer?.id} />
              {entries.length > 3 && (
                <div className="border-t border-border pt-4">
                  <RankingList
                    entries={entries.slice(3)}
                    currentPlayerId={currentPlayer?.id}
                    anchor={currentPlayer ? toRankingEntry(currentPlayer) : undefined}
                  />
                </div>
              )}
              {currentPlayer && entries.length <= 3 && (
                <div className="border-t border-border pt-4">
                  <RankingEntry entry={toRankingEntry(currentPlayer)} anchor />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Difficulty, Mission } from "@/features/missions/types";
import { useMissions } from "../hooks/use-missions";
import { DIFFICULTIES, DIFFICULTY_META } from "../lib/difficulty";
import { DifficultyCard } from "./difficulty-card";
import { DifficultyHeader } from "./difficulty-header";
import { MissionGrid } from "./mission-grid";

type Phase = "idle" | "expanding" | "expanded" | "collapsing";

const EXPAND_FADE_MS = 180;
const FLIP_MS = 420;
const FLIP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface DifficultyExplorerProps {
  selected: Difficulty | null;
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
}

export function DifficultyExplorer({
  selected,
  onSelect,
  onBack,
  onSelectMission,
}: DifficultyExplorerProps) {
  const { status, byDifficulty, completedMissionIds, retry } = useMissions();
  const [phase, setPhase] = useState<Phase>(selected ? "expanded" : "idle");

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const cardRefs = useRef(new Map<Difficulty, HTMLButtonElement>());
  const headerRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  const fromRectRef = useRef<DOMRect | null>(null);
  const backRectRef = useRef<DOMRect | null>(null);
  const targetRef = useRef<Difficulty | null>(null);

  const prevSelectedRef = useRef(selected);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const applyExpandFlip = useCallback(() => {
    const header = headerRef.current;
    const from = fromRectRef.current;
    if (!header || !from || prefersReducedMotion()) {
      return;
    }

    const to = header.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    header.style.transformOrigin = "top left";
    header.style.transition = "none";
    header.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void header.offsetWidth;
    header.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASING}`;
    header.style.transform = "";
    const clear = () => {
      header.style.transition = "";
      header.style.transform = "";
    };
    header.addEventListener("transitionend", clear, { once: true });
  }, []);

  const applyCollapseFlip = useCallback((target: Difficulty | null): boolean => {
    const card = target ? cardRefs.current.get(target) : undefined;
    const from = backRectRef.current;
    if (!card || !from || prefersReducedMotion()) {
      return false;
    }

    const to = card.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    card.style.transformOrigin = "top left";
    card.style.transition = "none";
    card.style.opacity = "0";
    card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    void card.offsetWidth;
    card.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASING}, opacity 300ms ease-out`;
    card.style.transform = "";
    card.style.opacity = "";
    const clear = () => {
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
    };
    card.addEventListener("transitionend", clear, { once: true });
    return true;
  }, []);

  useEffect(() => {
    const prev = prevSelectedRef.current;
    prevSelectedRef.current = selected;

    if (prev === selected) {
      return;
    }

    if (selected) {
      const reduced = prefersReducedMotion();
      setPhase("expanding");
      const fadeDelay = reduced ? 0 : EXPAND_FADE_MS;
      const timer = window.setTimeout(() => {
        const card = cardRefs.current.get(selected);
        fromRectRef.current = card ? card.getBoundingClientRect() : null;
        setPhase("expanded");
        requestAnimationFrame(() => {
          backRef.current?.focus();
          requestAnimationFrame(() => applyExpandFlip());
        });
      }, fadeDelay);
      return () => window.clearTimeout(timer);
    }

    if (phaseRef.current === "collapsing") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const applied = applyCollapseFlip(targetRef.current);
          window.setTimeout(() => setPhase("idle"), applied ? FLIP_MS : 0);
        });
      });
    } else {
      setPhase("idle");
    }
  }, [selected, applyExpandFlip, applyCollapseFlip]);

  const handleSelect = useCallback(
    (difficulty: Difficulty) => {
      targetRef.current = difficulty;
      onSelect(difficulty);
    },
    [onSelect],
  );

  const handleBack = useCallback(() => {
    if (phaseRef.current === "collapsing" || phaseRef.current === "expanding") {
      return;
    }
    const header = headerRef.current;
    backRectRef.current = header ? header.getBoundingClientRect() : null;
    targetRef.current = selectedRef.current;
    setPhase("collapsing");
    const reduced = prefersReducedMotion();
    window.setTimeout(
      () => {
        onBackRef.current();
      },
      reduced ? 0 : EXPAND_FADE_MS,
    );
  }, []);

  useEffect(() => {
    if (!selected || phase === "expanding") {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleBack();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, phase, handleBack]);

  const showExpanded = selected !== null && (phase === "expanded" || phase === "collapsing");
  const leaving = phase === "collapsing";

  if (showExpanded && selected) {
    const missions = byDifficulty[selected];
    const completedCount = missions.filter((mission) => completedMissionIds.has(mission.id)).length;
    const points = missions[0]?.points ?? null;

    return (
      <section
        aria-label={`Dificuldade ${DIFFICULTY_META[selected].label}`}
        className="flex flex-col gap-6 overflow-hidden"
      >
        <DifficultyHeader
          difficulty={selected}
          missionCount={missions.length}
          points={points}
          completedCount={completedCount}
          onBack={handleBack}
          headerRef={(node) => {
            headerRef.current = node;
          }}
          backRef={backRef}
        />
        <div className="transition-opacity duration-200" style={{ opacity: leaving ? 0 : 1 }}>
          <MissionGrid
            missions={missions}
            status={status}
            retry={retry}
            completedMissionIds={completedMissionIds}
            onSelectMission={onSelectMission}
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="missions-heading" className="flex flex-col gap-4">
      <h2
        id="missions-heading"
        className="font-display text-lg font-bold tracking-wide text-foreground"
      >
        Escolha uma dificuldade
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {DIFFICULTIES.map((difficulty) => {
          const entering = phase === "collapsing" && difficulty !== targetRef.current;
          const index = DIFFICULTIES.indexOf(difficulty);
          return (
            <DifficultyCard
              key={difficulty}
              ref={(node) => {
                if (node) {
                  cardRefs.current.set(difficulty, node);
                } else {
                  cardRefs.current.delete(difficulty);
                }
              }}
              difficulty={difficulty}
              missionCount={status === "success" ? byDifficulty[difficulty].length : null}
              selected={selected === difficulty}
              leaving={phase === "expanding" && selected !== difficulty}
              entering={entering}
              enterDelay={index * 60}
              onSelect={() => handleSelect(difficulty)}
            />
          );
        })}
      </div>
    </section>
  );
}

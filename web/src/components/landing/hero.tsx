"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowRight } from "lucide-react";

const ROBOT_LOTTIE_URL =
  "https://lottie.host/41e5efea-2bfb-4af0-b7a8-337d451e5777/vyqeLYohrS.lottie";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 py-12 sm:px-6 md:flex-row md:gap-12 md:py-20">
      <div className="flex flex-1 flex-col items-start gap-6 text-center md:text-left">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Segurança em jogo
        </span>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-wide text-foreground sm:text-5xl lg:text-6xl">
          Você realmente sabe sobre <span className="text-primary">segurança na internet</span>?
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Complete missões, aprenda na prática e prove seu nível em segurança digital. Cada desafio
          conta pontos e aproxima você do topo do ranking.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Descubra agora!
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="order-first flex w-full max-w-sm flex-shrink-0 items-center justify-center sm:max-w-md md:order-none">
        <div
          className="flex aspect-square w-full items-center justify-center rounded-3xl border border-border bg-card"
          aria-hidden="true"
        >
          <DotLottieReact
            src={ROBOT_LOTTIE_URL}
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}

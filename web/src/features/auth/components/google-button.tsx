"use client";

import { Globe } from "lucide-react";

export function GoogleButton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
      >
        <Globe className="h-5 w-5" aria-hidden="true" />
        Continuar com Google
      </button>
      <span className="text-xs text-muted-foreground">Disponivel em breve</span>
    </div>
  );
}

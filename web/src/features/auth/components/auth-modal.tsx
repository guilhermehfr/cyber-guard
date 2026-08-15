"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export type AuthMode = "register" | "login";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("register");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusables?.[0]?.focus();

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
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
  };

  const handleRegistered = () => {
    onClose();
  };

  const handleLoggedIn = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="auth-modal-title" className="font-display text-lg font-bold text-foreground">
            {mode === "register" ? "Criar conta" : "Entrar"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-border">
          <button
            type="button"
            onClick={() => switchMode("register")}
            aria-pressed={mode === "register"}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
              mode === "register"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrar
          </button>
          <button
            type="button"
            onClick={() => switchMode("login")}
            aria-pressed={mode === "login"}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
              mode === "login"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
        </div>

        <div className="px-6 py-6">
          {mode === "register" ? (
            <RegisterForm
              onRegistered={handleRegistered}
              onSwitchToLogin={() => switchMode("login")}
            />
          ) : (
            <LoginForm
              onLoggedIn={handleLoggedIn}
              onSwitchToRegister={() => switchMode("register")}
            />
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton />
        </div>
      </div>
    </div>
  );
}

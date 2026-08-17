"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth.api";
import { isAuthenticated } from "@/features/auth/lib/session";

interface NavbarProps {
  onAuthAction: () => void;
}

export function Navbar({ onAuthAction }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isPlay = pathname.startsWith("/play");

  const handleAuthAction = () => {
    if (isAuthenticated()) {
      router.push("/play");
      return;
    }

    onAuthAction();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2" aria-label="CyberGuard">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            CyberGuard
          </span>
        </a>

        <div className="flex items-center gap-3">
          {isPlay ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sair
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAuthAction}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Entrar
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FloatingBubbles } from "@/components/landing/floating-bubbles";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/layout/navbar";
import { AuthModal } from "@/features/auth/components/auth-modal";
import { isAuthenticated } from "@/features/auth/lib/session";

export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);

  const handleStart = () => {
    if (isAuthenticated()) {
      router.push("/play");
      return;
    }

    setAuthOpen(true);
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <FloatingBubbles />
      <Navbar onAuthAction={handleStart} />
      <Hero onStart={handleStart} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

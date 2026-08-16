"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthModal } from "@/features/auth/components/auth-modal";

const OAUTH_ERROR_MESSAGE = "Não foi possível entrar com o Google. Tente novamente.";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get("oauth") === "error";

  return (
    <AuthModal
      open
      initialMode="login"
      error={oauthError ? OAUTH_ERROR_MESSAGE : null}
      onClose={() => router.push("/")}
    />
  );
}

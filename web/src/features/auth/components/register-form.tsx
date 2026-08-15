"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "@/lib/api/errors";

import { authApi } from "../api/auth.api";
import { saveAccessToken } from "../lib/session";
import { validateRegister } from "../schemas/register.schema";

interface RegisterFormProps {
  onRegistered: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegistered, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    const result = validateRegister({ name, email, password });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    setErrors([]);

    try {
      const { accessToken } = await authApi.register(result.value);
      saveAccessToken(accessToken);
      onRegistered();
      router.push("/play");
    } catch (error) {
      setApiError(
        error instanceof ApiError && error.status === 409
          ? "Já existe uma conta com este email."
          : "Não foi possível criar a conta. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-name" className="text-sm font-medium text-foreground">
          Nome
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          placeholder="voce@exemplo.com"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
          placeholder="Minimo 8 caracteres"
          required
        />
      </div>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {apiError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {submitting ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Entrar
        </button>
      </p>
    </form>
  );
}

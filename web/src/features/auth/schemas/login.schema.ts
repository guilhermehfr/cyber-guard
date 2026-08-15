import type { LoginRequest } from "@cyber/contracts";

export type LoginResult = { ok: true; value: LoginRequest } | { ok: false; errors: string[] };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(input: unknown): LoginResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["Entrada inválida"] };
  }

  const { email, password } = input as Record<string, unknown>;

  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    errors.push("Informe um email válido");
  }

  if (typeof password !== "string" || password.trim() === "") {
    errors.push("A senha é obrigatória");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      email: (email as string).trim().toLowerCase(),
      password: password as string,
    },
  };
}

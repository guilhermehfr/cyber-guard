import type { RegisterRequest } from "@cyber/contracts";

export type RegisterResult = { ok: true; value: RegisterRequest } | { ok: false; errors: string[] };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(input: unknown): RegisterResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["Entrada inválida"] };
  }

  const { name, email, password } = input as Record<string, unknown>;

  if (typeof name !== "string" || name.trim() === "") {
    errors.push("O nome é obrigatório");
  }

  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    errors.push("Informe um email válido");
  }

  if (typeof password !== "string" || password.trim() === "") {
    errors.push("A senha é obrigatória");
  } else if (password.length < 8) {
    errors.push("A senha deve ter pelo menos 8 caracteres");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name: (name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      password: password as string,
    },
  };
}

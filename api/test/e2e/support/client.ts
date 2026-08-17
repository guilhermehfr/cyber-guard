import type { AuthResponse } from "@cyber/contracts";

export interface ApiResponse<T> {
  status: number;
  body: T;
  headers: Headers;
}

export interface ApiClientOptions {
  baseUrl?: string;
}

export class ApiClient {
  readonly baseUrl: string;

  private readonly cookies = new Map<string, string>();

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.E2E_API_URL ?? "http://localhost:3000";
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/register", { name, email, password });
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/login", { email, password });
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined) {
      headers.set("content-type", "application/json");
    }
    const cookieHeader = this.cookieHeader;
    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });

    for (const raw of response.headers.getSetCookie()) {
      const [pair] = raw.split(";");
      const separator = pair.indexOf("=");
      if (separator === -1) {
        continue;
      }
      this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }

    const contentType = response.headers.get("content-type") ?? "";
    const body = (
      contentType.includes("application/json") ? await response.json() : undefined
    ) as T;

    return { status: response.status, body, headers: response.headers };
  }

  private get cookieHeader(): string {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

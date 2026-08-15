const ACCESS_TOKEN_KEY = "cyberGuard.accessToken";

const AUTH_BYPASS =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return AUTH_BYPASS || getAccessToken() !== null;
}

export function saveAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

const AUTH_MARKER_COOKIE = "cyberguard.auth";

const AUTH_BYPASS =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

function getCookie(name: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  for (const part of window.document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }

  return null;
}

export function isAuthenticated(): boolean {
  return AUTH_BYPASS || getCookie(AUTH_MARKER_COOKIE) === "1";
}

import { ApiError, type ApiErrorData } from "./errors";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

async function parseErrorResponse(response: Response): Promise<ApiErrorData> {
  let data: ApiErrorData = {
    statusCode: response.status,
    message: response.statusText || "Request failed",
  };

  try {
    const body = await response.json();
    if (typeof body === "object" && body !== null) {
      data = body as ApiErrorData;
    }
  } catch {
    // Non-JSON error body; keep the default data.
  }

  return data;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError(0, {
      statusCode: 0,
      message: "NEXT_PUBLIC_API_URL is not configured",
    });
  }

  const hasBody = init?.body !== undefined;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorResponse(response));
  }

  return parseResponse<T>(response);
}

export interface ApiClient {
  get<T>(path: string, options?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T>;
}

export const api: ApiClient = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
};

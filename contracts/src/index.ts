export interface ServiceHealth {
  name: string;
  status: 'up' | 'degraded' | 'down';
  version: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: string;
}

export interface Greeting {
  message: string;
  timestamp: string;
}
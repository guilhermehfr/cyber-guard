export interface ApiErrorData {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: ApiErrorData;

  constructor(status: number, data: ApiErrorData) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

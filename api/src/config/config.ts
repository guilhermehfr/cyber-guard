export interface AppConfig {
  app: {
    environment: string;
    port: number;
    webUrl: string;
  };
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
}

export const configuration = (): AppConfig => ({
  app: {
    environment: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 3000),
    webUrl: process.env.WEB_URL ?? "http://localhost:3001",
  },
  database: {
    url: process.env.DATABASE_URL ?? "",
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",
  },
});

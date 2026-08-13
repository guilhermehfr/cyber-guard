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

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const configuration = (): AppConfig => ({
  app: {
    environment: getEnv("NODE_ENV"),
    port: Number(getEnv("PORT")),
    webUrl: getEnv("WEB_URL"),
  },
  database: {
    url: getEnv("DATABASE_URL"),
  },
  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN"),
  },
  google: {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    callbackUrl: getEnv("GOOGLE_CALLBACK_URL"),
  },
});

export interface AppConfig {
  app: {
    environment: string;
    port: number;
    webUrl: string[];
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    ttlSeconds: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  auth: {
    cookie: {
      name: string;
      markerName: string;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
    };
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

export const configuration = (): AppConfig => {
  const environment = getEnv("NODE_ENV");
  const isProduction = environment === "production";

  return {
    app: {
      environment,
      port: Number(getEnv("PORT")),
      webUrl: getEnv("WEB_URL")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    },
    database: {
      url: getEnv("DATABASE_URL"),
    },
    redis: {
      url: getEnv("REDIS_URL"),
      ttlSeconds: Number(getEnv("REDIS_TTL_SECONDS")),
    },
    jwt: {
      secret: getEnv("JWT_SECRET"),
      expiresIn: getEnv("JWT_EXPIRES_IN"),
    },
    auth: {
      cookie: {
        name: process.env.AUTH_COOKIE_NAME ?? "cyberguard.session",
        markerName: process.env.AUTH_COOKIE_MARKER_NAME ?? "cyberguard.auth",
        secure:
          process.env.AUTH_COOKIE_SECURE === undefined
            ? isProduction
            : process.env.AUTH_COOKIE_SECURE === "true",
        sameSite:
          process.env.AUTH_COOKIE_SAMESITE === undefined
            ? isProduction
              ? "none"
              : "lax"
            : (process.env.AUTH_COOKIE_SAMESITE as AppConfig["auth"]["cookie"]["sameSite"]),
      },
    },
    google: {
      clientId: getEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
      callbackUrl: getEnv("GOOGLE_CALLBACK_URL"),
    },
  };
};

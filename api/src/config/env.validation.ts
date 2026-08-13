import Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),

  PORT: Joi.number().default(3000),

  WEB_URL: Joi.string().uri().default("http://localhost:3001"),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),

  JWT_EXPIRES_IN: Joi.string().default("1d"),

  GOOGLE_CLIENT_ID: Joi.string().required(),

  GOOGLE_CLIENT_SECRET: Joi.string().required(),

  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
});

import * as Joi from "joi";

const DISALLOWED_SECRET_VALUES = [
  "replace-with-strong-access-secret",
  "replace-with-strong-refresh-secret",
  "changeme",
  "demo-secret",
];

const secureSecretSchema = Joi.string().min(32).invalid(...DISALLOWED_SECRET_VALUES).required();

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(4000),
  DATABASE_URL: Joi.string().min(1).required(),
  CLIENT_ORIGIN_ADMIN: Joi.string().uri().default("http://localhost:5173"),
  CLIENT_ORIGIN_PORTAL: Joi.string().uri().default("http://localhost:5174"),
  CLIENT_ORIGIN_PUBLIC: Joi.string().uri().default("http://localhost:5175"),
  SERPAPI_API_KEY: Joi.string().min(1).optional(),
  GEMINI_API_KEY: Joi.string().min(1).optional(),
  GEMINI_BASE_URL: Joi.string().uri().default("https://generativelanguage.googleapis.com/v1beta"),
  GEMINI_MODEL: Joi.string().min(1).default("gemini-2.5-flash"),
  JWT_ACCESS_SECRET: secureSecretSchema,
  JWT_REFRESH_SECRET: secureSecretSchema,
  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .pattern(/^\d+(s|m|h|d)$/)
    .default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^\d+(s|m|h|d)$/)
    .default("7d"),
  REFRESH_TOKEN_COOKIE_NAME: Joi.string().min(10).default("socialtech_refresh_token"),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(14).default(12),
  COOKIE_DOMAIN: Joi.string().hostname().optional(),
  LEAD_SCAN_DAILY_QUERY_LIMIT: Joi.number().integer().min(1).max(6).default(5),
  LEAD_SCAN_MAX_DAILY_QUERY_LIMIT: Joi.number().integer().min(1).max(6).default(6),
});

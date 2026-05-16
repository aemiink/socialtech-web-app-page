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
  GITHUB_API_BASE_URL: Joi.string().uri().default("https://api.github.com"),
  GITHUB_GLOBAL_TOKEN: Joi.string().min(1).optional(),
  GITHUB_TOKEN_ENCRYPTION_KEY: Joi.string().min(32).optional(),
  META_GRAPH_API_VERSION: Joi.string()
    .pattern(/^v\d+\.\d+$/)
    .default("v22.0"),
  META_TOKEN_ENCRYPTION_KEY: Joi.string().min(32).optional(),
  META_APP_ID: Joi.string().min(1).optional(),
  META_APP_SECRET: Joi.string().min(1).optional(),
  META_REDIRECT_URI: Joi.string().uri().optional(),
  META_ADS_SYNC_TTL_MINUTES: Joi.number().integer().min(1).max(1440).default(30),
  GOOGLE_ADS_DEVELOPER_TOKEN: Joi.string().min(1).optional().allow(""),
  GOOGLE_ADS_CLIENT_ID: Joi.string().min(1).optional().allow(""),
  GOOGLE_ADS_CLIENT_SECRET: Joi.string().min(1).optional().allow(""),
  GOOGLE_ADS_REDIRECT_URI: Joi.string().uri().optional().allow(""),
  GOOGLE_ADS_TOKEN_ENCRYPTION_KEY: Joi.string().min(32).optional().allow(""),
  GOOGLE_ADS_TEST_CONNECTION_MOCK: Joi.string().valid("true", "false").default("true"),
  GOOGLE_ADS_REPORTING_MOCK: Joi.string().valid("true", "false").default("true"),
  GOOGLE_ADS_SYNC_TTL_MINUTES: Joi.number().integer().min(1).max(1440).default(30),
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: Joi.string()
    .pattern(/^(\d{10}|\d{3}-\d{3}-\d{4})$/)
    .optional()
    .allow(""),
  CLOUDINARY_CLOUD_NAME: Joi.string().min(1).optional(),
  CLOUDINARY_API_KEY: Joi.string().min(1).optional(),
  CLOUDINARY_API_SECRET: Joi.string().min(1).optional(),
  FILE_UPLOAD_MAX_MB: Joi.number().integer().min(1).max(1024).default(200),
  FILE_SHARE_TOKEN_SECRET: Joi.string().min(32).optional(),
  FILE_SHARE_DEFAULT_EXP_HOURS: Joi.number().integer().min(1).max(720).default(72),
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

import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(4000),
  DATABASE_URL: Joi.string().min(1).required(),
  CLIENT_ORIGIN_ADMIN: Joi.string().uri().default("http://localhost:5173"),
  CLIENT_ORIGIN_PORTAL: Joi.string().uri().default("http://localhost:5174"),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
});

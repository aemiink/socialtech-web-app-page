import { ConfigService } from "@nestjs/config";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
];

export function createCorsOptions(configService: ConfigService): CorsOptions {
  const nodeEnv = configService.get<string>("NODE_ENV")?.trim().toLowerCase();
  const isProduction = nodeEnv === "production";
  const allowAllDevOrigins =
    !isProduction &&
    (configService.get<string>("CORS_ALLOW_ALL_DEV_ORIGINS")?.trim().toLowerCase() ?? "true") !==
      "false";
  const adminOrigin = configService.get<string>("CLIENT_ORIGIN_ADMIN")?.trim();
  const portalOrigin = configService.get<string>("CLIENT_ORIGIN_PORTAL")?.trim();
  const publicOrigin = configService.get<string>("CLIENT_ORIGIN_PUBLIC")?.trim();
  const extraOriginsRaw = configService.get<string>("CLIENT_ORIGIN_EXTRA")?.trim();

  const allowedOrigins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);

  if (adminOrigin) {
    allowedOrigins.add(adminOrigin);
  }
  if (portalOrigin) {
    allowedOrigins.add(portalOrigin);
  }
  if (publicOrigin) {
    allowedOrigins.add(publicOrigin);
  }
  if (extraOriginsRaw) {
    for (const origin of extraOriginsRaw.split(",")) {
      const normalized = origin.trim();
      if (normalized.length > 0) {
        allowedOrigins.add(normalized);
      }
    }
  }

  return {
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Auth-Scope",
      "X-Requested-With",
      "X-Request-Id",
    ],
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || allowAllDevOrigins) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"), false);
    },
  };
}

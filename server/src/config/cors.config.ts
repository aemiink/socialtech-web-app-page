import { ConfigService } from "@nestjs/config";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

export function createCorsOptions(configService: ConfigService): CorsOptions {
  const adminOrigin = configService.get<string>("CLIENT_ORIGIN_ADMIN")?.trim();
  const portalOrigin = configService.get<string>("CLIENT_ORIGIN_PORTAL")?.trim();

  const allowedOrigins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);

  if (adminOrigin) {
    allowedOrigins.add(adminOrigin);
  }
  if (portalOrigin) {
    allowedOrigins.add(portalOrigin);
  }

  return {
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With", "X-Request-Id"],
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"), false);
    },
  };
}

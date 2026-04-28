import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type HealthResponse = {
  status: "ok";
  timestamp: string;
  uptime: number;
  environment: string;
};

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>("NODE_ENV") ?? "development",
    };
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";

type ErrorBody = {
  message: string | string[];
  error: string;
  details?: unknown;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const parsed = this.parseExceptionBody(exception, statusCode);

    response.status(statusCode).json({
      success: false,
      error: {
        code: parsed.error,
        message: parsed.message,
        details: parsed.details ?? null,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(isProduction ? {} : parsed.stack ? { stack: parsed.stack } : {}),
    });
  }

  private parseExceptionBody(
    exception: unknown,
    statusCode: number,
  ): ErrorBody & { stack?: string } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "string") {
        return {
          message: response,
          error: this.resolveErrorCode(statusCode),
          stack: exception.stack,
        };
      }

      if (this.isRecord(response)) {
        const message = this.extractMessage(response);
        const error = this.extractError(response, statusCode);
        const details = response.details;

        return {
          message,
          error,
          details,
          stack: exception.stack,
        };
      }
    }

    if (exception instanceof Error) {
      return {
        message: exception.message,
        error: this.resolveErrorCode(statusCode),
        stack: exception.stack,
      };
    }

    return {
      message: "Unexpected error occurred",
      error: this.resolveErrorCode(statusCode),
    };
  }

  private extractMessage(payload: Record<string, unknown>): string | string[] {
    const rawMessage = payload.message;

    if (typeof rawMessage === "string") {
      return rawMessage;
    }

    if (Array.isArray(rawMessage)) {
      const messages = rawMessage.filter((item): item is string => typeof item === "string");
      return messages.length > 0 ? messages : "Unexpected error occurred";
    }

    return "Unexpected error occurred";
  }

  private extractError(payload: Record<string, unknown>, statusCode: number): string {
    const rawError = payload.error;
    if (typeof rawError === "string" && rawError.length > 0) {
      return rawError;
    }

    return this.resolveErrorCode(statusCode);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private resolveErrorCode(statusCode: number): string {
    return HttpStatus[statusCode] ?? "INTERNAL_SERVER_ERROR";
  }
}

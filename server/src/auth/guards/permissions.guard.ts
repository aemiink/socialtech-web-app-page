import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const currentUser = request.user;
    if (!currentUser) {
      throw new ForbiddenException("Authenticated user context is missing.");
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      currentUser.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException("Missing required permissions.");
    }

    return true;
  }
}

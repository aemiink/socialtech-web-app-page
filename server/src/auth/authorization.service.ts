import { Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissionsForRole(role: UserRole): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role },
      select: {
        permission: {
          select: { slug: true },
        },
      },
    });

    const resolvedPermissions = rolePermissions.map((item) => item.permission.slug);
    if (role !== UserRole.ADMIN) {
      return resolvedPermissions;
    }

    // Admin role is treated as super-user in this product.
    // This fallback prevents stale rolePermission mappings from blocking newly added admin scopes.
    const allPermissions = await this.prisma.permission.findMany({
      select: { slug: true },
    });

    const permissionSet = new Set<string>(resolvedPermissions);
    for (const permission of allPermissions) {
      permissionSet.add(permission.slug);
    }

    return Array.from(permissionSet);
  }
}

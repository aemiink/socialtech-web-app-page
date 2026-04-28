import { Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissionsForRole(role: UserRole): Promise<string[]> {
    const permissions = await this.prisma.rolePermission.findMany({
      where: { role },
      select: {
        permission: {
          select: { slug: true },
        },
      },
    });

    return permissions.map((item) => item.permission.slug);
  }
}

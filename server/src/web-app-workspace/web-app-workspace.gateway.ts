import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  PurchasedServiceKey,
  UserRole,
  UserStatus,
  WebAppWorkspaceTabKey,
} from "@prisma/client";
import { Server, Socket } from "socket.io";
import { UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AuthorizationService } from "../auth/authorization.service";
import { AccessTokenPayload } from "../auth/types/token-payload.type";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";

type WorkspaceRoomPayload = {
  projectId: string;
  tabKey: WebAppWorkspaceTabKey;
};

@WebSocketGateway({
  namespace: "/web-app-workspace",
  cors: { origin: true, credentials: true },
})
export class WebAppWorkspaceGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;
  private workspaceEventSequence = 0;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractBearerToken(client);
      if (!token) {
        throw new UnauthorizedException("Missing bearer access token.");
      }

      const payload = await this.verifyAccessToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          accountType: true,
          role: true,
          clientProfileId: true,
          status: true,
          sessionInvalidatedAt: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException("User session is no longer valid.");
      }

      this.assertAccessTokenSessionIsValid(payload, user.sessionInvalidatedAt);
      const permissions = await this.authorizationService.getPermissionsForRole(user.role);

      client.data.user = {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        role: user.role,
        clientProfileId: user.clientProfileId,
        permissions,
      } satisfies AuthenticatedUser;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage("project:join")
  async handleProjectJoin(client: Socket, payload: WorkspaceRoomPayload) {
    const user = this.getAuthenticatedUser(client);
    await this.assertCanReadProject(user, payload.projectId);
    const room = this.toProjectRoom(payload.projectId);
    await client.join(room);
    return {
      success: true,
      room,
      projectId: payload.projectId,
      tabKey: payload.tabKey,
    };
  }

  @SubscribeMessage("project:leave")
  async handleProjectLeave(client: Socket, payload: WorkspaceRoomPayload) {
    const room = this.toProjectRoom(payload.projectId);
    await client.leave(room);
    return {
      success: true,
      room,
      projectId: payload.projectId,
      tabKey: payload.tabKey,
    };
  }

  emitWorkspaceUpdate(
    projectId: string,
    tabKey: WebAppWorkspaceTabKey,
    event: string,
    payload: Record<string, unknown>,
  ) {
    if (!this.server) {
      return;
    }
    const sequence = ++this.workspaceEventSequence;
    this.server.to(this.toProjectRoom(projectId)).emit("workspace:update", {
      projectId,
      tabKey,
      event,
      payload,
      sequence,
      emittedAt: new Date().toISOString(),
    });
  }

  private async assertCanReadProject(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientProfileId: true, serviceKey: true },
    });
    if (!project || project.serviceKey !== PurchasedServiceKey.WEB_APP) {
      throw new UnauthorizedException("Project scope is not available.");
    }

    if (currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN) {
      if (
        this.hasPermission(currentUser, [
          "webapp.workspace.read.any",
          "webapp.workspace.manage.any",
        ])
      ) {
        return;
      }
      throw new UnauthorizedException("Missing workspace permissions.");
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      if (
        currentUser.clientProfileId === project.clientProfileId &&
        this.hasPermission(currentUser, ["webapp.workspace.read.own"])
      ) {
        return;
      }
      throw new UnauthorizedException("Missing workspace permissions.");
    }

    if (
      !this.hasPermission(currentUser, [
        "webapp.workspace.read.assigned",
        "webapp.workspace.manage.assigned",
      ])
    ) {
      throw new UnauthorizedException("Missing workspace permissions.");
    }

    const assignment = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
        scope: {
          in: [
            EmployeeClientAssignmentScope.PROJECT,
            EmployeeClientAssignmentScope.DEVELOPMENT,
            EmployeeClientAssignmentScope.DESIGN,
          ],
        },
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new UnauthorizedException("Project scope is not available.");
    }
  }

  private getAuthenticatedUser(client: Socket): AuthenticatedUser {
    const user = client.data.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException("Authenticated user context is missing.");
    }
    return user;
  }

  private extractBearerToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim().length > 0) {
      return authToken.startsWith("Bearer ") ? authToken.slice(7) : authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (typeof authorization !== "string") {
      return null;
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  private async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      if (payload.tokenType !== "access") {
        throw new UnauthorizedException("Invalid token type.");
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired access token.");
    }
  }

  private assertAccessTokenSessionIsValid(
    payload: AccessTokenPayload,
    sessionInvalidatedAt: Date | null,
  ): void {
    if (!sessionInvalidatedAt) {
      return;
    }

    const invalidatedVersion = sessionInvalidatedAt.getTime();
    if (typeof payload.siv === "number" && Number.isFinite(payload.siv)) {
      if (Math.floor(payload.siv) !== invalidatedVersion) {
        throw new UnauthorizedException("Access token session is no longer valid.");
      }
      return;
    }

    if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat)) {
      throw new UnauthorizedException("Access token session is no longer valid.");
    }

    if (Math.floor(payload.iat) <= Math.floor(sessionInvalidatedAt.getTime() / 1000)) {
      throw new UnauthorizedException("Access token session is no longer valid.");
    }
  }

  private hasPermission(currentUser: AuthenticatedUser, permissions: readonly string[]) {
    return permissions.some((permission) => currentUser.permissions.includes(permission));
  }

  private toProjectRoom(projectId: string) {
    return `project:${projectId}`;
  }
}

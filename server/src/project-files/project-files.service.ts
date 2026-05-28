import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AccountType,
  EmployeeClientAssignmentScope,
  MetaAdsApprovalStatus,
  Prisma,
  ProjectFileVisibility,
  PurchasedServiceKey,
  UserRole,
} from "@prisma/client";
import { randomBytes, randomUUID, createHash } from "crypto";
import { ConfigService } from "@nestjs/config";
import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { PrismaService } from "../database/prisma.service";
import { CloudinaryService } from "../integrations/cloudinary/cloudinary.service";
import { CompleteUploadDto } from "./dto/complete-upload.dto";
import { CreateProjectFileFolderDto } from "./dto/create-project-file-folder.dto";
import { CreateProjectFileShareLinkDto } from "./dto/create-project-file-share-link.dto";
import { CreateUploadSignatureDto } from "./dto/create-upload-signature.dto";
import { ProjectFileQueryDto } from "./dto/project-file-query.dto";
import { ProjectFileShareLinkQueryDto } from "./dto/project-file-share-link-query.dto";
import { UpdateProjectFileFolderAssigneesDto } from "./dto/update-project-file-folder-assignees.dto";
import { UpdateProjectFileFolderDto } from "./dto/update-project-file-folder.dto";

const MANAGE_ANY_PERMISSION = "projects.files.manage.any";
const MANAGE_ASSIGNED_PERMISSION = "projects.files.manage.assigned";
const READ_ASSIGNED_PERMISSION = "projects.files.read.assigned";
const SHARE_ASSIGNED_PERMISSION = "projects.files.share.assigned";
const READ_OWN_PERMISSION = "projects.files.read.own";
const META_ADS_CREATIVES_MANAGE_ASSIGNED_PERMISSION = "metaAds.creatives.manage.assigned";
const TIKTOK_ADS_CREATIVES_MANAGE_ASSIGNED_PERMISSION = "tiktokAds.creatives.manage.assigned";
const AMAZON_ADS_PRODUCT_COLLABORATION_MANAGE_ASSIGNED_PERMISSION =
  "amazonAds.productCollaboration.manage.assigned";

const projectFileReadSelect = {
  id: true,
  projectId: true,
  folderId: true,
  clientProfileId: true,
  serviceKey: true,
  category: true,
  visibility: true,
  title: true,
  description: true,
  publicId: true,
  secureUrl: true,
  resourceType: true,
  format: true,
  bytes: true,
  mimeType: true,
  originalFileName: true,
  approvalRequired: true,
  approvalType: true,
  approvalStatus: true,
  approvalResponseNote: true,
  approvalRequestedAt: true,
  approvalRespondedAt: true,
  approvalRespondedByUserId: true,
  campaignRef: true,
  adSetRef: true,
  adRef: true,
  performanceSummary: true,
  uploadedByUserId: true,
  createdAt: true,
  updatedAt: true,
  folder: {
    select: {
      id: true,
      name: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      clientProfileId: true,
      clientProfile: {
        select: {
          id: true,
          companyName: true,
          slug: true,
        },
      },
    },
  },
  uploader: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
  approvalRespondedBy: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
} satisfies Prisma.ProjectFileSelect;

@Injectable()
export class ProjectFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

  async createUploadSignature(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateUploadSignatureDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    this.assertFileSizeLimit(dto.bytes);
    this.assertFolderSelectionRequired(dto.folderId);
    const overwrite = Boolean(dto.overwrite && dto.overwriteFileId);
    const approvalStatus =
      dto.approvalStatus ?? (dto.approvalRequired ? MetaAdsApprovalStatus.PENDING : null);

    if (overwrite && dto.overwriteFileId) {
      await this.assertOverwriteFile(currentUser, project.id, dto.overwriteFileId);
    }
    await this.assertFolder(project.id, dto.folderId);
    await this.assertEmployeeFolderAssignmentForUpload(currentUser, project.id, dto.folderId);

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
    const publicId = `${project.id}/${datePrefix}/${randomUUID()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.cloudinaryService.createUploadSignature({
      timestamp,
      publicId,
      overwrite,
    });

    return {
      ...signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
      projectId: project.id,
      clientProfileId: project.clientProfileId,
      category: dto.category,
      visibility: dto.visibility,
      title: dto.title,
      description: dto.description ?? null,
      overwrite,
      overwriteFileId: dto.overwriteFileId ?? null,
      approvalRequired: dto.approvalRequired ?? false,
      approvalType: dto.approvalType ?? null,
      approvalStatus,
      approvalResponseNote: dto.approvalResponseNote ?? null,
      campaignRef: dto.campaignRef ?? null,
      adSetRef: dto.adSetRef ?? null,
      adRef: dto.adRef ?? null,
      performanceSummary: dto.performanceSummary ?? null,
    };
  }

  async completeUpload(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CompleteUploadDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    this.assertFileSizeLimit(dto.bytes);
    this.assertFolderSelectionRequired(dto.folderId);

    const overwrite = Boolean(dto.overwrite && dto.overwriteFileId);
    const approvalStatus =
      dto.approvalStatus ?? (dto.approvalRequired ? MetaAdsApprovalStatus.PENDING : null);
    const shouldCaptureApprovalResponse =
      approvalStatus !== null && approvalStatus !== MetaAdsApprovalStatus.PENDING;
    const approvalRequestedAt = approvalStatus === MetaAdsApprovalStatus.PENDING ? new Date() : null;
    const approvalRespondedAt = shouldCaptureApprovalResponse ? new Date() : null;
    const approvalRespondedByUserId = shouldCaptureApprovalResponse ? currentUser.id : null;
    const performanceSummaryInput = dto.performanceSummary
      ? (dto.performanceSummary as Prisma.InputJsonValue)
      : Prisma.JsonNull;
    await this.assertFolder(project.id, dto.folderId);
    await this.assertEmployeeFolderAssignmentForUpload(currentUser, project.id, dto.folderId);
    if (overwrite && dto.overwriteFileId) {
      const existing = await this.assertOverwriteFile(currentUser, project.id, dto.overwriteFileId);
      return this.prisma.projectFile.update({
        where: { id: existing.id },
        data: {
          title: dto.title,
          description: dto.description ?? null,
          publicId: dto.publicId,
          secureUrl: dto.secureUrl,
          resourceType: dto.resourceType,
          format: dto.format ?? null,
          bytes: dto.bytes,
          mimeType: dto.mimeType,
          originalFileName: dto.originalFileName,
          category: dto.category,
          visibility: dto.visibility,
          folderId: dto.folderId,
          approvalRequired: dto.approvalRequired ?? false,
          approvalType: dto.approvalType ?? null,
          approvalStatus,
          approvalResponseNote: dto.approvalResponseNote ?? null,
          approvalRequestedAt,
          approvalRespondedAt,
          approvalRespondedByUserId,
          campaignRef: dto.campaignRef ?? null,
          adSetRef: dto.adSetRef ?? null,
          adRef: dto.adRef ?? null,
          performanceSummary: performanceSummaryInput,
          uploadedByUserId: currentUser.id,
        },
        select: projectFileReadSelect,
      });
    }

    return this.prisma.projectFile.create({
      data: {
        projectId: project.id,
        clientProfileId: project.clientProfileId,
        serviceKey: project.serviceKey,
        title: dto.title,
        description: dto.description ?? null,
        publicId: dto.publicId,
        secureUrl: dto.secureUrl,
        resourceType: dto.resourceType,
        format: dto.format ?? null,
        bytes: dto.bytes,
        mimeType: dto.mimeType,
        originalFileName: dto.originalFileName,
        category: dto.category,
        visibility: dto.visibility,
        folderId: dto.folderId,
        approvalRequired: dto.approvalRequired ?? false,
        approvalType: dto.approvalType ?? null,
        approvalStatus,
        approvalResponseNote: dto.approvalResponseNote ?? null,
        approvalRequestedAt,
        approvalRespondedAt,
        approvalRespondedByUserId,
        campaignRef: dto.campaignRef ?? null,
        adSetRef: dto.adSetRef ?? null,
        adRef: dto.adRef ?? null,
        performanceSummary: performanceSummaryInput,
        uploadedByUserId: currentUser.id,
      },
      select: projectFileReadSelect,
    });
  }

  async getProjectFiles(
    currentUser: AuthenticatedUser,
    projectId: string,
    query: ProjectFileQueryDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    const assignedFolderIds = await this.getEmployeeAssignedFolderIds(currentUser, project.id);
    const where: Prisma.ProjectFileWhereInput = {
      projectId: project.id,
      ...(query.category ? { category: query.category } : {}),
      ...(query.visibility ? { visibility: query.visibility } : {}),
      ...(query.approvalRequired !== undefined
        ? { approvalRequired: query.approvalRequired }
        : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...(query.approvalType ? { approvalType: query.approvalType } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { originalFileName: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.folderId ? { folderId: query.folderId } : {}),
      ...(assignedFolderIds ? { folderId: { in: assignedFolderIds } } : {}),
      ...(currentUser.accountType === AccountType.CLIENT
        ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE }
        : {}),
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.projectFile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        select: projectFileReadSelect,
      }),
      this.prisma.projectFile.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getProjectFileById(currentUser: AuthenticatedUser, projectId: string, fileId: string) {
    await this.assertReadableProject(currentUser, projectId);
    const assignedFolderIds = await this.getEmployeeAssignedFolderIds(currentUser, projectId);
    const file = await this.prisma.projectFile.findFirst({
      where: {
        id: fileId,
        projectId,
        ...(assignedFolderIds ? { folderId: { in: assignedFolderIds } } : {}),
        ...(currentUser.accountType === AccountType.CLIENT
          ? { visibility: ProjectFileVisibility.CLIENT_VISIBLE }
          : {}),
      },
      select: projectFileReadSelect,
    });
    if (!file) {
      throw new NotFoundException("Project file not found.");
    }

    return file;
  }

  async getProjectFolders(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.assertReadableProject(currentUser, projectId);
    const assignedFolderIds = await this.getEmployeeAssignedFolderIds(currentUser, project.id);
    return this.prisma.projectFileFolder.findMany({
      where: {
        projectId: project.id,
        ...(assignedFolderIds ? { id: { in: assignedFolderIds } } : {}),
      },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        projectId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getFolderAssignees(currentUser: AuthenticatedUser, projectId: string, folderId: string) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    await this.assertFolder(project.id, folderId);

    const assignableUsers = await this.getAssignableEmployees(project.clientProfileId);
    const assignments = await this.prisma.projectFileFolderAssignment.findMany({
      where: { folderId },
      select: { assignedUserId: true },
    });
    const assignedSet = new Set(assignments.map((item: { assignedUserId: string }) => item.assignedUserId));

    return assignableUsers.map((employee) => ({
      id: employee.id,
      displayName: employee.displayName,
      email: employee.email,
      role: employee.role,
      isAssigned: assignedSet.has(employee.id),
    }));
  }

  async updateFolderAssignees(
    currentUser: AuthenticatedUser,
    projectId: string,
    folderId: string,
    dto: UpdateProjectFileFolderAssigneesDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    await this.assertFolder(project.id, folderId);

    const nextUserIds = Array.from(new Set(dto.userIds ?? []));
    const assignableUsers = await this.getAssignableEmployees(project.clientProfileId);
    const assignableUserIds = new Set(assignableUsers.map((item) => item.id));

    for (const userId of nextUserIds) {
      if (!assignableUserIds.has(userId)) {
        throw new BadRequestException("Folder assignment includes a user outside project scope.");
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.projectFileFolderAssignment.deleteMany({
        where: {
          folderId,
          ...(nextUserIds.length > 0 ? { assignedUserId: { notIn: nextUserIds } } : {}),
        },
      });

      if (nextUserIds.length > 0) {
        await tx.projectFileFolderAssignment.createMany({
          data: nextUserIds.map((assignedUserId) => ({ folderId, assignedUserId })),
          skipDuplicates: true,
        });
      }
    });

    return this.getFolderAssignees(currentUser, project.id, folderId);
  }

  async createProjectFolder(
    currentUser: AuthenticatedUser,
    projectId: string,
    dto: CreateProjectFileFolderDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);

    const normalizedName = dto.name.trim();
    if (!normalizedName) {
      throw new BadRequestException("Folder name is required.");
    }

    const existing = await this.prisma.projectFileFolder.findFirst({
      where: {
        projectId: project.id,
        name: { equals: normalizedName, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException("Folder name already exists in this project.");
    }

    return this.prisma.projectFileFolder.create({
      data: {
        projectId: project.id,
        name: normalizedName,
        createdByUserId: currentUser.id,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProjectFileFolder(
    currentUser: AuthenticatedUser,
    projectId: string,
    fileId: string,
    dto: UpdateProjectFileFolderDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);

    if (dto.folderId) {
      await this.assertFolder(project.id, dto.folderId);
    }

    const file = await this.prisma.projectFile.findFirst({
      where: { id: fileId, projectId: project.id },
      select: { id: true },
    });
    if (!file) {
      throw new NotFoundException("Project file not found.");
    }

    return this.prisma.projectFile.update({
      where: { id: file.id },
      data: { folderId: dto.folderId ?? null },
      select: projectFileReadSelect,
    });
  }

  async deleteProjectFile(currentUser: AuthenticatedUser, projectId: string, fileId: string) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanManageFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    const file = await this.prisma.projectFile.findFirst({
      where: { id: fileId, projectId: project.id },
      select: { id: true, publicId: true, resourceType: true },
    });
    if (!file) {
      throw new NotFoundException("Project file not found.");
    }

    await this.cloudinaryService.deleteAsset(file.publicId, file.resourceType);
    await this.prisma.projectFile.delete({ where: { id: file.id } });
    return { success: true };
  }

  async createShareLink(
    currentUser: AuthenticatedUser,
    projectId: string,
    fileId: string,
    dto: CreateProjectFileShareLinkDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanShareFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    const file = await this.prisma.projectFile.findFirst({
      where: { id: fileId, projectId: project.id },
      select: { id: true },
    });
    if (!file) {
      throw new NotFoundException("Project file not found.");
    }

    const token = `${randomUUID()}${randomBytes(16).toString("hex")}`;
    const tokenHash = this.hashShareToken(token);
    const expiresInHours =
      dto.expiresInHours ?? this.configService.get<number>("FILE_SHARE_DEFAULT_EXP_HOURS", 72);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const share = await this.prisma.projectFileShareLink.create({
      data: {
        projectFileId: file.id,
        tokenHash,
        expiresAt,
        createdByUserId: currentUser.id,
      },
      select: {
        id: true,
        projectFileId: true,
        expiresAt: true,
        isRevoked: true,
        createdAt: true,
      },
    });

    return {
      ...share,
      token,
      shareUrl: `${this.getApiBaseUrl()}/file-shares/${token}`,
    };
  }

  async getShareLinks(
    currentUser: AuthenticatedUser,
    projectId: string,
    query: ProjectFileShareLinkQueryDto,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanShareFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);

    return this.prisma.projectFileShareLink.findMany({
      where: {
        ...(query.fileId ? { projectFileId: query.fileId } : {}),
        projectFile: { projectId: project.id },
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        projectFileId: true,
        expiresAt: true,
        isRevoked: true,
        createdAt: true,
        projectFile: {
          select: {
            id: true,
            title: true,
            originalFileName: true,
          },
        },
      },
    });
  }

  async revokeShareLink(
    currentUser: AuthenticatedUser,
    projectId: string,
    fileId: string,
    shareId: string,
  ) {
    const project = await this.assertReadableProject(currentUser, projectId);
    await this.assertCanShareFiles(currentUser, project.id, project.clientProfileId, project.serviceKey);
    const share = await this.prisma.projectFileShareLink.findFirst({
      where: {
        id: shareId,
        projectFileId: fileId,
        projectFile: { projectId: project.id },
      },
      select: { id: true },
    });
    if (!share) {
      throw new NotFoundException("Share link not found.");
    }

    await this.prisma.projectFileShareLink.update({
      where: { id: share.id },
      data: { isRevoked: true },
    });
    return { success: true };
  }

  async resolveShareToken(token: string) {
    const tokenHash = this.hashShareToken(token);
    const share = await this.prisma.projectFileShareLink.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        expiresAt: true,
        isRevoked: true,
        projectFile: {
          select: {
            id: true,
            title: true,
            secureUrl: true,
            mimeType: true,
            bytes: true,
            visibility: true,
          },
        },
      },
    });
    if (!share || share.isRevoked || share.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException("Share link is invalid or expired.");
    }

    return {
      id: share.id,
      title: share.projectFile.title,
      secureUrl: share.projectFile.secureUrl,
      mimeType: share.projectFile.mimeType,
      bytes: share.projectFile.bytes,
      expiresAt: share.expiresAt,
    };
  }

  private async assertReadableProject(currentUser: AuthenticatedUser, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientProfileId: true, serviceKey: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found.");
    }

    if (currentUser.accountType === AccountType.ADMIN) {
      if (currentUser.role === UserRole.ADMIN) {
        return project;
      }
      if (
        !this.hasPermission(currentUser, [
          "projects.read.any",
          "projects.read",
          "projects.manage.any",
          MANAGE_ANY_PERMISSION,
        ])
      ) {
        throw new ForbiddenException("Missing required project permissions.");
      }
      return project;
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      if (!this.hasPermission(currentUser, [READ_OWN_PERMISSION, "projects.read.own"])) {
        throw new ForbiddenException("Missing required project file permissions.");
      }
      if (currentUser.clientProfileId !== project.clientProfileId) {
        throw new NotFoundException("Project not found.");
      }
      return project;
    }

    if (!this.hasPermission(currentUser, [READ_ASSIGNED_PERMISSION, "projects.read.assigned"])) {
      throw new ForbiddenException("Missing required project file permissions.");
    }

    const isAssigned = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId: project.clientProfileId,
        isActive: true,
        scope: { in: [EmployeeClientAssignmentScope.PROJECT, EmployeeClientAssignmentScope.DEVELOPMENT, EmployeeClientAssignmentScope.DESIGN] },
      },
      select: { id: true },
    });
    if (!isAssigned) {
      throw new NotFoundException("Project not found.");
    }

    return project;
  }

  private async assertCanManageFiles(
    currentUser: AuthenticatedUser,
    projectId: string,
    clientProfileId: string,
    projectServiceKey: PurchasedServiceKey | null,
  ) {
    if (currentUser.accountType === AccountType.ADMIN && currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (
      this.hasPermission(currentUser, [
        MANAGE_ANY_PERMISSION,
        "projects.manage.any",
        "projects.read.any",
      ])
    ) {
      return;
    }
    if (currentUser.accountType === AccountType.CLIENT) {
      throw new ForbiddenException("Clients cannot upload or delete files.");
    }
    if (!this.hasPermission(currentUser, [MANAGE_ASSIGNED_PERMISSION])) {
      throw new ForbiddenException("Missing required project file permissions.");
    }

    if (
      currentUser.accountType === AccountType.EMPLOYEE &&
      projectServiceKey === PurchasedServiceKey.META_ADS &&
      !this.hasPermission(currentUser, [META_ADS_CREATIVES_MANAGE_ASSIGNED_PERMISSION])
    ) {
      throw new ForbiddenException("Missing required Meta Ads creative permissions.");
    }

    if (
      currentUser.accountType === AccountType.EMPLOYEE &&
      projectServiceKey === PurchasedServiceKey.TIKTOK_ADS &&
      !this.hasPermission(currentUser, [TIKTOK_ADS_CREATIVES_MANAGE_ASSIGNED_PERMISSION])
    ) {
      throw new ForbiddenException("Missing required TikTok Ads creative permissions.");
    }

    if (
      currentUser.accountType === AccountType.EMPLOYEE &&
      projectServiceKey === PurchasedServiceKey.AMAZON_ADS &&
      !this.hasPermission(currentUser, [AMAZON_ADS_PRODUCT_COLLABORATION_MANAGE_ASSIGNED_PERMISSION])
    ) {
      throw new ForbiddenException("Missing required Amazon Ads product collaboration permissions.");
    }

    if (currentUser.accountType === AccountType.ADMIN) {
      return;
    }

    const isAssigned = await this.prisma.employeeClientAssignment.findFirst({
      where: {
        employeeUserId: currentUser.id,
        clientProfileId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!isAssigned) {
      throw new NotFoundException("Project not found.");
    }

    void projectId;
  }

  private async assertCanShareFiles(
    currentUser: AuthenticatedUser,
    projectId: string,
    clientProfileId: string,
    projectServiceKey: PurchasedServiceKey | null,
  ) {
    await this.assertCanManageFiles(currentUser, projectId, clientProfileId, projectServiceKey);
    if (!this.hasPermission(currentUser, [SHARE_ASSIGNED_PERMISSION, MANAGE_ANY_PERMISSION])) {
      throw new ForbiddenException("Missing required project file share permissions.");
    }
  }

  private assertFileSizeLimit(bytes: number) {
    const maxMb = this.configService.get<number>("FILE_UPLOAD_MAX_MB", 200);
    const maxBytes = maxMb * 1024 * 1024;
    if (bytes > maxBytes) {
      throw new BadRequestException(`File size exceeds configured max of ${maxMb}MB.`);
    }
  }

  private async assertOverwriteFile(currentUser: AuthenticatedUser, projectId: string, fileId: string) {
    const file = await this.prisma.projectFile.findFirst({
      where: { id: fileId, projectId },
      select: {
        id: true,
        visibility: true,
        project: { select: { clientProfileId: true } },
      },
    });
    if (!file) {
      throw new NotFoundException("File to overwrite not found.");
    }

    if (currentUser.accountType === AccountType.CLIENT) {
      throw new ForbiddenException("Clients cannot overwrite files.");
    }

    return file;
  }

  private async assertFolder(projectId: string, folderId: string) {
    const folder = await this.prisma.projectFileFolder.findFirst({
      where: { id: folderId, projectId },
      select: { id: true },
    });
    if (!folder) {
      throw new NotFoundException("Project folder not found.");
    }
  }

  private async getAssignableEmployees(clientProfileId: string) {
    const assignments = await this.prisma.employeeClientAssignment.findMany({
      where: {
        clientProfileId,
        isActive: true,
      },
      distinct: ["employeeUserId"],
      select: {
        employeeUser: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            accountType: true,
          },
        },
      },
    });

    return assignments
      .map((item) => item.employeeUser)
      .filter((employee): employee is NonNullable<typeof employee> => Boolean(employee))
      .filter((employee) => employee.accountType === AccountType.EMPLOYEE);
  }

  private async getEmployeeAssignedFolderIds(currentUser: AuthenticatedUser, projectId: string) {
    if (currentUser.accountType !== AccountType.EMPLOYEE) {
      return null;
    }

    const assignedFolderRows = await this.prisma.projectFileFolderAssignment.findMany({
      where: {
        assignedUserId: currentUser.id,
        folder: { projectId },
      },
      select: { folderId: true },
    });

    if (assignedFolderRows.length === 0) {
      return null;
    }

    return assignedFolderRows.map((item: { folderId: string }) => item.folderId);
  }

  private assertFolderSelectionRequired(folderId: string | null | undefined) {
    if (!folderId) {
      throw new BadRequestException("folderId is required for project file uploads.");
    }
  }

  private async assertEmployeeFolderAssignmentForUpload(
    currentUser: AuthenticatedUser,
    projectId: string,
    folderId: string,
  ) {
    const assignedFolderIds = await this.getEmployeeAssignedFolderIds(currentUser, projectId);
    if (!assignedFolderIds) {
      return;
    }

    if (!assignedFolderIds.includes(folderId)) {
      throw new ForbiddenException("You can upload only to folders assigned to you.");
    }
  }

  private hasPermission(currentUser: AuthenticatedUser, permissions: readonly string[]) {
    return permissions.some((permission) => currentUser.permissions.includes(permission));
  }

  private hashShareToken(token: string) {
    const secret =
      this.configService.get<string>("FILE_SHARE_TOKEN_SECRET") ??
      this.configService.get<string>("JWT_ACCESS_SECRET", "fallback-file-share-secret");
    return createHash("sha256").update(`${secret}:${token}`).digest("hex");
  }

  private getApiBaseUrl() {
    const port = this.configService.get<number>("PORT", 4000);
    return `http://localhost:${port}/api/v1`;
  }
}

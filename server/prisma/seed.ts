import * as bcrypt from "bcryptjs";
import {
  PrismaClient,
  AccountType,
  ClientStatus,
  EmployeeClientAssignmentScope,
  Priority,
  ProjectStatus,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  TaskStatus,
  TaskTodoVisibility,
  UserRole,
  UserStatus,
} from "@prisma/client";

type PermissionSeed = {
  slug: string;
  description: string;
};

type DemoUserSeed = {
  email: string;
  displayName: string;
  accountType: AccountType;
  role: UserRole;
  clientProfileSlug?: string;
};

type ClientProfileSeed = {
  slug: string;
  companyName: string;
  contactEmail: string;
  status: ClientStatus;
};

type EmployeeClientAssignmentSeed = {
  employeeEmail: string;
  clientSlug: string;
  scope: EmployeeClientAssignmentScope;
  isActive?: boolean;
};

type ClientPurchasedServiceSeed = {
  clientSlug: string;
  serviceKey: PurchasedServiceKey;
  status: PurchasedServiceStatus;
  startedAt?: Date;
};

type ProjectSeed = {
  clientSlug: string;
  slug: string;
  name: string;
  description?: string;
  serviceKey?: PurchasedServiceKey;
  status: ProjectStatus;
  priority: Priority;
  startDate?: Date;
  dueDate?: Date;
};

type TaskSeed = {
  projectClientSlug: string;
  projectSlug: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeEmail?: string;
  dueDate?: Date;
};

type TaskTodoSeed = {
  projectClientSlug: string;
  projectSlug: string;
  taskTitle: string;
  title: string;
  description?: string;
  visibility: TaskTodoVisibility;
  isCompleted?: boolean;
  completedAt?: Date;
  completedByEmail?: string;
};

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";
const BCRYPT_SALT_ROUNDS = resolveBcryptSaltRounds();
const CLIENT_PROFILE_SEEDS: ClientProfileSeed[] = [
  {
    slug: "acme-e-ticaret",
    companyName: "Acme E-ticaret",
    contactEmail: "client@socialtech.com",
    status: ClientStatus.ACTIVE,
  },
  {
    slug: "nova-performance",
    companyName: "Nova Performance",
    contactEmail: "contact@novaperformance.com",
    status: ClientStatus.SUSPENDED,
  },
  {
    slug: "mavi-sosyal",
    companyName: "Mavi Sosyal",
    contactEmail: "hello@mavisosyal.com",
    status: ClientStatus.INACTIVE,
  },
];

const EMPLOYEE_CLIENT_ASSIGNMENTS: EmployeeClientAssignmentSeed[] = [
  {
    employeeEmail: "project@socialtech.com",
    clientSlug: "acme-e-ticaret",
    scope: EmployeeClientAssignmentScope.PROJECT,
  },
  {
    employeeEmail: "project@socialtech.com",
    clientSlug: "nova-performance",
    scope: EmployeeClientAssignmentScope.PROJECT,
  },
  {
    employeeEmail: "project@socialtech.com",
    clientSlug: "mavi-sosyal",
    scope: EmployeeClientAssignmentScope.PROJECT,
  },
  {
    employeeEmail: "performance@socialtech.com",
    clientSlug: "acme-e-ticaret",
    scope: EmployeeClientAssignmentScope.PERFORMANCE,
  },
  {
    employeeEmail: "performance@socialtech.com",
    clientSlug: "nova-performance",
    scope: EmployeeClientAssignmentScope.PERFORMANCE,
  },
  {
    employeeEmail: "social@socialtech.com",
    clientSlug: "acme-e-ticaret",
    scope: EmployeeClientAssignmentScope.SOCIAL_MEDIA,
  },
  {
    employeeEmail: "social@socialtech.com",
    clientSlug: "mavi-sosyal",
    scope: EmployeeClientAssignmentScope.SOCIAL_MEDIA,
  },
];

const CLIENT_PURCHASED_SERVICE_SEEDS: ClientPurchasedServiceSeed[] = [
  {
    clientSlug: "acme-e-ticaret",
    serviceKey: PurchasedServiceKey.GROWTH_HUB,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-04-15T00:00:00.000Z"),
  },
  {
    clientSlug: "acme-e-ticaret",
    serviceKey: PurchasedServiceKey.META_ADS,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-04-20T00:00:00.000Z"),
  },
  {
    clientSlug: "acme-e-ticaret",
    serviceKey: PurchasedServiceKey.WEB_APP,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-05-01T00:00:00.000Z"),
  },
  {
    clientSlug: "nova-performance",
    serviceKey: PurchasedServiceKey.META_ADS,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-04-01T00:00:00.000Z"),
  },
  {
    clientSlug: "nova-performance",
    serviceKey: PurchasedServiceKey.GOOGLE_ADS,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-04-01T00:00:00.000Z"),
  },
  {
    clientSlug: "nova-performance",
    serviceKey: PurchasedServiceKey.TIKTOK_ADS,
    status: PurchasedServiceStatus.PAUSED,
    startedAt: new Date("2026-04-10T00:00:00.000Z"),
  },
  {
    clientSlug: "mavi-sosyal",
    serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-05-01T00:00:00.000Z"),
  },
  {
    clientSlug: "mavi-sosyal",
    serviceKey: PurchasedServiceKey.MEDIA_HUB,
    status: PurchasedServiceStatus.ACTIVE,
    startedAt: new Date("2026-05-01T00:00:00.000Z"),
  },
  {
    clientSlug: "mavi-sosyal",
    serviceKey: PurchasedServiceKey.WEB_MOBILE_DESIGN,
    status: PurchasedServiceStatus.PAUSED,
    startedAt: new Date("2026-05-10T00:00:00.000Z"),
  },
];

const PROJECT_SEEDS: ProjectSeed[] = [
  {
    clientSlug: "acme-e-ticaret",
    slug: "growth-hub-launch",
    name: "Growth Hub Launch",
    description: "Launch foundation for Acme E-ticaret growth operations.",
    serviceKey: PurchasedServiceKey.GROWTH_HUB,
    status: ProjectStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    startDate: new Date("2026-04-15T00:00:00.000Z"),
    dueDate: new Date("2026-06-15T00:00:00.000Z"),
  },
  {
    clientSlug: "nova-performance",
    slug: "paid-acquisition-optimization",
    name: "Paid Acquisition Optimization",
    description: "Performance sprint covering paid media audit, tracking, and optimization.",
    serviceKey: PurchasedServiceKey.META_ADS,
    status: ProjectStatus.REVIEW,
    priority: Priority.URGENT,
    startDate: new Date("2026-04-01T00:00:00.000Z"),
    dueDate: new Date("2026-05-20T00:00:00.000Z"),
  },
  {
    clientSlug: "mavi-sosyal",
    slug: "social-calendar-refresh",
    name: "Social Calendar Refresh",
    description: "Monthly social content workflow and approval foundation.",
    serviceKey: PurchasedServiceKey.SOCIAL_MEDIA,
    status: ProjectStatus.PLANNED,
    priority: Priority.MEDIUM,
    startDate: new Date("2026-05-01T00:00:00.000Z"),
    dueDate: new Date("2026-06-01T00:00:00.000Z"),
  },
];

const TASK_SEEDS: TaskSeed[] = [
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Confirm kickoff scope and milestones",
    description: "Align Acme launch scope, milestone owners, and delivery checkpoints.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeEmail: "project@socialtech.com",
    dueDate: new Date("2026-05-05T00:00:00.000Z"),
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Prepare performance tracking plan",
    description: "Define campaign measurement events and reporting dimensions.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    assigneeEmail: "performance@socialtech.com",
    dueDate: new Date("2026-05-10T00:00:00.000Z"),
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Draft launch content calendar",
    description: "Prepare launch-week social captions, post themes, and approval dates.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeEmail: "social@socialtech.com",
    dueDate: new Date("2026-05-12T00:00:00.000Z"),
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    title: "Review paid media audit findings",
    description: "Validate channel findings and prepare optimization recommendations.",
    status: TaskStatus.REVIEW,
    priority: Priority.URGENT,
    assigneeEmail: "performance@socialtech.com",
    dueDate: new Date("2026-05-03T00:00:00.000Z"),
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    title: "Coordinate optimization approval",
    description: "Collect client approval requirements and package next-step recommendations.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeEmail: "project@socialtech.com",
    dueDate: new Date("2026-05-08T00:00:00.000Z"),
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    title: "Build May social calendar",
    description: "Create content themes, caption briefs, and posting cadence for May.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    assigneeEmail: "social@socialtech.com",
    dueDate: new Date("2026-05-07T00:00:00.000Z"),
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    title: "Set approval workflow checkpoints",
    description: "Confirm review dates and responsible contacts for calendar approval.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeEmail: "project@socialtech.com",
    dueDate: new Date("2026-05-09T00:00:00.000Z"),
  },
];

const TASK_TODO_SEEDS: TaskTodoSeed[] = [
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    taskTitle: "Confirm kickoff scope and milestones",
    title: "Share kickoff agenda with client",
    description: "Send the client-facing agenda and milestone summary before kickoff.",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    taskTitle: "Confirm kickoff scope and milestones",
    title: "Review internal handoff notes",
    description: "Validate delivery ownership and internal blockers before the client call.",
    visibility: TaskTodoVisibility.INTERNAL,
    isCompleted: true,
    completedAt: new Date("2026-04-30T09:00:00.000Z"),
    completedByEmail: "project@socialtech.com",
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    taskTitle: "Prepare performance tracking plan",
    title: "Confirm primary conversion events",
    description: "Align visible conversion events with the client before implementation.",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    taskTitle: "Prepare performance tracking plan",
    title: "Map analytics implementation notes",
    visibility: TaskTodoVisibility.INTERNAL,
    isCompleted: true,
    completedAt: new Date("2026-05-01T08:00:00.000Z"),
    completedByEmail: "performance@socialtech.com",
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    taskTitle: "Review paid media audit findings",
    title: "Publish audit summary for client review",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
    isCompleted: true,
    completedAt: new Date("2026-05-01T10:00:00.000Z"),
    completedByEmail: "performance@socialtech.com",
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    taskTitle: "Build May social calendar",
    title: "Upload client-visible draft calendar",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
  },
];

const PERMISSIONS: PermissionSeed[] = [
  { slug: "dashboard.read", description: "Read dashboard summaries." },
  { slug: "admin.summary.read", description: "Read admin summary dashboard data." },
  { slug: "users.read", description: "Read user list and user details." },
  { slug: "users.manage", description: "Create/update/deactivate users." },
  { slug: "clients.read", description: "Read client data in full scope." },
  { slug: "clients.manage", description: "Create and update client data." },
  { slug: "clients.read.assigned", description: "Read assigned client data." },
  { slug: "clients.read.own", description: "Read own client profile data." },
  { slug: "assignments.read", description: "Read employee-client assignments." },
  { slug: "assignments.manage", description: "Create/update/deactivate employee-client assignments." },
  { slug: "projects.read", description: "Read projects." },
  { slug: "projects.manage", description: "Create and update projects." },
  { slug: "projects.read.any", description: "Read all client projects." },
  { slug: "projects.manage.any", description: "Create and update all client projects." },
  { slug: "projects.read.assigned", description: "Read assigned projects." },
  { slug: "projects.read.own", description: "Read own client projects." },
  { slug: "tasks.read", description: "Read tasks." },
  { slug: "tasks.manage", description: "Manage all tasks." },
  { slug: "tasks.read.any", description: "Read all project tasks." },
  { slug: "tasks.manage.any", description: "Create and update all project tasks." },
  { slug: "tasks.read.assigned", description: "Read assigned tasks." },
  { slug: "tasks.update.assigned", description: "Update assigned tasks." },
  { slug: "tasks.read.own", description: "Read own client tasks." },
  { slug: "tasks.update.own", description: "Update owned tasks." },
  { slug: "approvals.read", description: "Read approval requests." },
  { slug: "approvals.manage", description: "Manage approval requests." },
  { slug: "approvals.respond.own", description: "Respond to own approvals." },
  { slug: "reports.read", description: "Read reports." },
  { slug: "reports.manage", description: "Create and manage reports." },
  { slug: "reports.read.own", description: "Read own reports." },
  { slug: "meetings.read", description: "Read meetings." },
  { slug: "meetings.manage", description: "Create and update meetings." },
  { slug: "meetings.read.own", description: "Read own meetings." },
  { slug: "billing.read", description: "Read billing data." },
  { slug: "billing.manage", description: "Manage billing data." },
  { slug: "billing.read.own", description: "Read own billing data." },
  { slug: "portal.read.own", description: "Access own client portal." },
  { slug: "client_actions.read.own", description: "Read own client actions." },
  { slug: "client_actions.create.own", description: "Create own client actions." },
  { slug: "settings.read", description: "Read settings." },
  { slug: "settings.manage", description: "Manage global settings." },
  { slug: "settings.manage.own", description: "Manage own settings." },
  { slug: "audit_logs.read", description: "Read audit logs." },
];

const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  ADMIN: PERMISSIONS.map((permission) => permission.slug),
  PROJECT_MANAGER: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "approvals.read",
    "approvals.manage",
    "reports.read",
    "reports.manage",
    "meetings.read",
    "meetings.manage",
    "settings.read",
  ],
  PERFORMANCE_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  SOCIAL_MEDIA_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "approvals.read",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  DESIGNER: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "approvals.read",
    "settings.read",
  ],
  DEVELOPER: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "settings.read",
  ],
  SUPPORT_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "settings.read",
  ],
  SEO_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  CLIENT_OWNER: [
    "portal.read.own",
    "clients.read.own",
    "projects.read.own",
    "tasks.read.own",
    "approvals.respond.own",
    "reports.read.own",
    "meetings.read.own",
    "billing.read.own",
    "client_actions.read.own",
    "client_actions.create.own",
    "settings.manage.own",
  ],
  CLIENT_MEMBER: [
    "portal.read.own",
    "clients.read.own",
    "projects.read.own",
    "tasks.read.own",
    "approvals.respond.own",
    "reports.read.own",
    "meetings.read.own",
    "client_actions.read.own",
    "client_actions.create.own",
    "settings.manage.own",
  ],
};

const DEMO_USERS: DemoUserSeed[] = [
  {
    email: "admin@socialtech.com",
    displayName: "Demo Admin",
    accountType: AccountType.ADMIN,
    role: UserRole.ADMIN,
  },
  {
    email: "project@socialtech.com",
    displayName: "Demo Project Manager",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.PROJECT_MANAGER,
  },
  {
    email: "performance@socialtech.com",
    displayName: "Demo Performance Specialist",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.PERFORMANCE_SPECIALIST,
  },
  {
    email: "social@socialtech.com",
    displayName: "Demo Social Media Specialist",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.SOCIAL_MEDIA_SPECIALIST,
  },
  {
    email: "designer@socialtech.com",
    displayName: "Demo Designer",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.DESIGNER,
  },
  {
    email: "developer@socialtech.com",
    displayName: "Demo Developer",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.DEVELOPER,
  },
  {
    email: "support@socialtech.com",
    displayName: "Demo Support Specialist",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.SUPPORT_SPECIALIST,
  },
  {
    email: "seo@socialtech.com",
    displayName: "Demo SEO Specialist",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.SEO_SPECIALIST,
  },
  {
    email: "client@socialtech.com",
    displayName: "Demo Client Owner",
    accountType: AccountType.CLIENT,
    role: UserRole.CLIENT_OWNER,
    clientProfileSlug: "acme-e-ticaret",
  },
];

function resolveBcryptSaltRounds(): number {
  const parsed = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10);
  if (!Number.isInteger(parsed)) {
    return 12;
  }

  return Math.min(Math.max(parsed, 10), 14);
}

function isModernPasswordHash(hash: string): boolean {
  return (
    hash.startsWith("$2a$") ||
    hash.startsWith("$2b$") ||
    hash.startsWith("$2y$") ||
    hash.startsWith("$argon2")
  );
}

async function seedPasswordHash(): Promise<string> {
  return bcrypt.hash(DEMO_PASSWORD, BCRYPT_SALT_ROUNDS);
}

async function seedPermissions(): Promise<Map<string, string>> {
  const permissionIdBySlug = new Map<string, string>();

  for (const permission of PERMISSIONS) {
    const result = await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: { description: permission.description },
      create: permission,
      select: { id: true, slug: true },
    });

    permissionIdBySlug.set(result.slug, result.id);
  }

  return permissionIdBySlug;
}

async function seedRolePermissions(permissionIdBySlug: Map<string, string>): Promise<void> {
  const rolePermissionIdsByRole = new Map<UserRole, string[]>();

  for (const [role, permissionSlugs] of Object.entries(ROLE_PERMISSIONS)) {
    const normalizedRole = role as UserRole;
    const permissionIds = permissionSlugs.map((slug) => {
      const permissionId = permissionIdBySlug.get(slug);
      if (!permissionId) {
        throw new Error(`Missing permission id for slug: ${slug}`);
      }

      return permissionId;
    });

    rolePermissionIdsByRole.set(normalizedRole, Array.from(new Set(permissionIds)));
  }

  for (const role of Object.values(UserRole)) {
    const desiredPermissionIds = rolePermissionIdsByRole.get(role) ?? [];

    if (desiredPermissionIds.length === 0) {
      await prisma.rolePermission.deleteMany({
        where: { role },
      });
      continue;
    }

    await prisma.rolePermission.deleteMany({
      where: {
        role,
        permissionId: { notIn: desiredPermissionIds },
      },
    });

    await prisma.rolePermission.createMany({
      data: desiredPermissionIds.map((permissionId) => ({
        role,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedClientProfiles(): Promise<Map<string, string>> {
  const clientProfileIdBySlug = new Map<string, string>();

  for (const profile of CLIENT_PROFILE_SEEDS) {
    const clientProfile = await prisma.clientProfile.upsert({
      where: { slug: profile.slug },
      update: {
        companyName: profile.companyName,
        contactEmail: profile.contactEmail,
        status: profile.status,
      },
      create: profile,
      select: { id: true, slug: true },
    });

    clientProfileIdBySlug.set(clientProfile.slug, clientProfile.id);
  }

  return clientProfileIdBySlug;
}

async function seedClientPurchasedServices(
  clientProfileIdBySlug: Map<string, string>,
): Promise<void> {
  for (const service of CLIENT_PURCHASED_SERVICE_SEEDS) {
    const clientProfileId = clientProfileIdBySlug.get(service.clientSlug);
    if (!clientProfileId) {
      throw new Error(`Missing client profile for purchased service: ${service.clientSlug}`);
    }

    await prisma.clientPurchasedService.upsert({
      where: {
        clientProfileId_serviceKey: {
          clientProfileId,
          serviceKey: service.serviceKey,
        },
      },
      update: {
        status: service.status,
        startedAt: service.startedAt ?? null,
      },
      create: {
        clientProfileId,
        serviceKey: service.serviceKey,
        status: service.status,
        startedAt: service.startedAt ?? null,
      },
    });
  }
}

async function seedUsers(clientProfileIdBySlug: Map<string, string>): Promise<void> {
  for (const user of DEMO_USERS) {
    const resolvedClientProfileId = user.clientProfileSlug
      ? clientProfileIdBySlug.get(user.clientProfileSlug)
      : null;
    if (user.clientProfileSlug && !resolvedClientProfileId) {
      throw new Error(`Missing client profile for slug: ${user.clientProfileSlug}`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        passwordHash: true,
      },
    });
    const passwordHash =
      existingUser && isModernPasswordHash(existingUser.passwordHash)
        ? existingUser.passwordHash
        : await seedPasswordHash();

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        passwordHash,
        accountType: user.accountType,
        role: user.role,
        status: UserStatus.ACTIVE,
        clientProfileId: resolvedClientProfileId,
      },
      create: {
        email: user.email,
        displayName: user.displayName,
        passwordHash,
        accountType: user.accountType,
        role: user.role,
        status: UserStatus.ACTIVE,
        clientProfileId: resolvedClientProfileId,
      },
    });
  }
}

async function seedEmployeeClientAssignments(
  clientProfileIdBySlug: Map<string, string>,
): Promise<void> {
  const demoEmployeeEmails = DEMO_USERS.filter((user) => user.accountType === AccountType.EMPLOYEE).map(
    (user) => user.email,
  );
  const employeeRows = await prisma.user.findMany({
    where: {
      email: { in: demoEmployeeEmails },
    },
    select: {
      id: true,
      email: true,
      accountType: true,
    },
  });

  const employeeByEmail = new Map(employeeRows.map((employee) => [employee.email, employee]));

  await prisma.employeeClientAssignment.deleteMany({
    where: {
      employeeUserId: {
        in: employeeRows.map((employee) => employee.id),
      },
    },
  });

  for (const assignment of EMPLOYEE_CLIENT_ASSIGNMENTS) {
    const employee = employeeByEmail.get(assignment.employeeEmail);
    if (!employee) {
      throw new Error(`Missing employee user for assignment: ${assignment.employeeEmail}`);
    }
    if (employee.accountType !== AccountType.EMPLOYEE) {
      throw new Error(`Assignment user is not employee: ${assignment.employeeEmail}`);
    }

    const clientProfileId = clientProfileIdBySlug.get(assignment.clientSlug);
    if (!clientProfileId) {
      throw new Error(`Missing client profile for assignment slug: ${assignment.clientSlug}`);
    }

    await prisma.employeeClientAssignment.upsert({
      where: {
        employeeUserId_clientProfileId_scope: {
          employeeUserId: employee.id,
          clientProfileId,
          scope: assignment.scope,
        },
      },
      update: {
        isActive: assignment.isActive ?? true,
      },
      create: {
        employeeUserId: employee.id,
        clientProfileId,
        scope: assignment.scope,
        isActive: assignment.isActive ?? true,
      },
    });
  }
}

function projectSeedKey(clientSlug: string, projectSlug: string): string {
  return `${clientSlug}:${projectSlug}`;
}

async function seedProjects(clientProfileIdBySlug: Map<string, string>): Promise<Map<string, string>> {
  const projectIdByKey = new Map<string, string>();

  for (const project of PROJECT_SEEDS) {
    const clientProfileId = clientProfileIdBySlug.get(project.clientSlug);
    if (!clientProfileId) {
      throw new Error(`Missing client profile for project slug: ${project.clientSlug}`);
    }

    const result = await prisma.project.upsert({
      where: {
        clientProfileId_slug: {
          clientProfileId,
          slug: project.slug,
        },
      },
      update: {
        name: project.name,
        description: project.description ?? null,
        status: project.status,
        priority: project.priority,
        serviceKey: project.serviceKey ?? null,
        startDate: project.startDate ?? null,
        dueDate: project.dueDate ?? null,
      },
      create: {
        clientProfileId,
        name: project.name,
        slug: project.slug,
        description: project.description ?? null,
        status: project.status,
        priority: project.priority,
        serviceKey: project.serviceKey ?? null,
        startDate: project.startDate ?? null,
        dueDate: project.dueDate ?? null,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    projectIdByKey.set(projectSeedKey(project.clientSlug, result.slug), result.id);
  }

  return projectIdByKey;
}

async function seedTasks(projectIdByKey: Map<string, string>): Promise<void> {
  const assigneeEmails = Array.from(
    new Set(
      TASK_SEEDS.flatMap((task) => (task.assigneeEmail ? [task.assigneeEmail] : [])),
    ),
  );
  const assigneeRows = await prisma.user.findMany({
    where: {
      email: { in: assigneeEmails },
    },
    select: {
      id: true,
      email: true,
      accountType: true,
    },
  });
  const assigneeByEmail = new Map(assigneeRows.map((assignee) => [assignee.email, assignee]));

  for (const task of TASK_SEEDS) {
    const projectId = projectIdByKey.get(projectSeedKey(task.projectClientSlug, task.projectSlug));
    if (!projectId) {
      throw new Error(
        `Missing project for task seed: ${task.projectClientSlug}/${task.projectSlug}`,
      );
    }

    const assignee = task.assigneeEmail ? assigneeByEmail.get(task.assigneeEmail) : null;
    if (task.assigneeEmail && !assignee) {
      throw new Error(`Missing assignee user for task: ${task.assigneeEmail}`);
    }
    if (assignee && assignee.accountType !== AccountType.EMPLOYEE) {
      throw new Error(`Task assignee is not employee: ${assignee.email}`);
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        projectId,
        title: task.title,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    if (existingTask) {
      await prisma.task.update({
        where: { id: existingTask.id },
        data: {
          description: task.description ?? null,
          status: task.status,
          priority: task.priority,
          assigneeUserId: assignee?.id ?? null,
          dueDate: task.dueDate ?? null,
        },
      });
      continue;
    }

    await prisma.task.create({
      data: {
        projectId,
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        assigneeUserId: assignee?.id ?? null,
        dueDate: task.dueDate ?? null,
      },
    });
  }
}

async function seedTaskTodos(projectIdByKey: Map<string, string>): Promise<void> {
  const completedByEmails = Array.from(
    new Set(
      TASK_TODO_SEEDS.flatMap((todo) => (todo.completedByEmail ? [todo.completedByEmail] : [])),
    ),
  );
  const completedByRows = await prisma.user.findMany({
    where: {
      email: { in: completedByEmails },
    },
    select: {
      id: true,
      email: true,
    },
  });
  const completedByUserByEmail = new Map(completedByRows.map((user) => [user.email, user]));

  for (const todo of TASK_TODO_SEEDS) {
    const projectId = projectIdByKey.get(projectSeedKey(todo.projectClientSlug, todo.projectSlug));
    if (!projectId) {
      throw new Error(
        `Missing project for task todo seed: ${todo.projectClientSlug}/${todo.projectSlug}`,
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        projectId,
        title: todo.taskTitle,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!task) {
      throw new Error(`Missing task for todo seed: ${todo.taskTitle}`);
    }

    const completedByUser = todo.completedByEmail
      ? completedByUserByEmail.get(todo.completedByEmail)
      : null;
    if (todo.completedByEmail && !completedByUser) {
      throw new Error(`Missing completedBy user for task todo: ${todo.completedByEmail}`);
    }

    const isCompleted = todo.isCompleted ?? false;
    const completedAt = isCompleted ? todo.completedAt ?? new Date() : null;
    const completedByUserId = isCompleted ? completedByUser?.id ?? null : null;

    const existingTodo = await prisma.taskTodo.findFirst({
      where: {
        taskId: task.id,
        title: todo.title,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (existingTodo) {
      await prisma.taskTodo.update({
        where: { id: existingTodo.id },
        data: {
          description: todo.description ?? null,
          visibility: todo.visibility,
          isCompleted,
          completedAt,
          completedByUserId,
        },
      });
      continue;
    }

    await prisma.taskTodo.create({
      data: {
        taskId: task.id,
        title: todo.title,
        description: todo.description ?? null,
        visibility: todo.visibility,
        isCompleted,
        completedAt,
        completedByUserId,
      },
    });
  }
}

async function main(): Promise<void> {
  const permissionIdBySlug = await seedPermissions();
  await seedRolePermissions(permissionIdBySlug);
  const clientProfileIdBySlug = await seedClientProfiles();
  await seedClientPurchasedServices(clientProfileIdBySlug);
  await seedUsers(clientProfileIdBySlug);
  await seedEmployeeClientAssignments(clientProfileIdBySlug);
  const projectIdByKey = await seedProjects(clientProfileIdBySlug);
  await seedTasks(projectIdByKey);
  await seedTaskTodos(projectIdByKey);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Prisma seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

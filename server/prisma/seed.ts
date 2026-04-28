import * as bcrypt from "bcryptjs";
import { PrismaClient, AccountType, UserRole, UserStatus } from "@prisma/client";

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

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";
const BCRYPT_SALT_ROUNDS = resolveBcryptSaltRounds();
const CLIENT_PROFILE_SEED = {
  slug: "acme-e-ticaret",
  companyName: "Acme E-ticaret",
  contactEmail: "client@socialtech.com",
};

const PERMISSIONS: PermissionSeed[] = [
  { slug: "dashboard.read", description: "Read dashboard summaries." },
  { slug: "users.read", description: "Read user list and user details." },
  { slug: "users.manage", description: "Create/update/deactivate users." },
  { slug: "clients.read", description: "Read client data in full scope." },
  { slug: "clients.manage", description: "Create and update client data." },
  { slug: "clients.read.assigned", description: "Read assigned client data." },
  { slug: "clients.read.own", description: "Read own client profile data." },
  { slug: "projects.read", description: "Read projects." },
  { slug: "projects.manage", description: "Create and update projects." },
  { slug: "projects.read.assigned", description: "Read assigned projects." },
  { slug: "tasks.read", description: "Read tasks." },
  { slug: "tasks.manage", description: "Manage all tasks." },
  { slug: "tasks.read.assigned", description: "Read assigned tasks." },
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
    "clients.read",
    "clients.read.assigned",
    "projects.read",
    "projects.manage",
    "tasks.read",
    "tasks.manage",
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
    "tasks.update.own",
    "approvals.read",
    "settings.read",
  ],
  DEVELOPER: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.own",
    "settings.read",
  ],
  SUPPORT_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "tasks.read.assigned",
    "tasks.update.own",
    "settings.read",
  ],
  SEO_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.own",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  CLIENT_OWNER: [
    "portal.read.own",
    "clients.read.own",
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
    clientProfileSlug: CLIENT_PROFILE_SEED.slug,
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
  const rolePermissionRows = Object.entries(ROLE_PERMISSIONS).flatMap(([role, permissionSlugs]) =>
    permissionSlugs.map((slug) => {
      const permissionId = permissionIdBySlug.get(slug);
      if (!permissionId) {
        throw new Error(`Missing permission id for slug: ${slug}`);
      }

      return {
        role: role as UserRole,
        permissionId,
      };
    }),
  );

  for (const row of rolePermissionRows) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: row.role,
          permissionId: row.permissionId,
        },
      },
      update: {},
      create: {
        role: row.role,
        permissionId: row.permissionId,
      },
    });
  }
}

async function seedClientProfile(): Promise<string> {
  const clientProfile = await prisma.clientProfile.upsert({
    where: { slug: CLIENT_PROFILE_SEED.slug },
    update: {
      companyName: CLIENT_PROFILE_SEED.companyName,
      contactEmail: CLIENT_PROFILE_SEED.contactEmail,
    },
    create: CLIENT_PROFILE_SEED,
    select: { id: true },
  });

  return clientProfile.id;
}

async function seedUsers(clientProfileId: string): Promise<void> {
  for (const user of DEMO_USERS) {
    const resolvedClientProfileId =
      user.clientProfileSlug === CLIENT_PROFILE_SEED.slug ? clientProfileId : null;
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

async function main(): Promise<void> {
  const permissionIdBySlug = await seedPermissions();
  await seedRolePermissions(permissionIdBySlug);
  const clientProfileId = await seedClientProfile();
  await seedUsers(clientProfileId);
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

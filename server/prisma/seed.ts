import * as bcrypt from "bcryptjs";
import {
  PrismaClient,
  AccountType,
  ClientStatus,
  CrmLeadActivityType,
  CrmLeadSource,
  CrmLeadStatus,
  DeliveryReleaseApprovalStatus,
  DeliveryReleaseStatus,
  DeliverySprintStatus,
  EmployeeClientAssignmentScope,
  Priority,
  ProjectStatus,
  PurchasedServiceKey,
  PurchasedServiceStatus,
  RepositoryProvider,
  TaskEnvironment,
  TaskSeverity,
  TaskStatus,
  TaskType,
  TaskTodoVisibility,
  TaskWorkstream,
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
  figmaProjectUrl?: string;
  repositoryUrl?: string;
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
  type?: TaskType;
  workstream?: TaskWorkstream;
  severity?: TaskSeverity;
  environment?: TaskEnvironment;
  affectedUrl?: string;
  reproductionSteps?: string;
  reportedBy?: string;
  code?: string;
  sprintName?: string;
  assigneeEmail?: string;
  dueDate?: Date;
};

type DeliverySprintSeed = {
  projectClientSlug: string;
  projectSlug: string;
  name: string;
  goal?: string;
  status: DeliverySprintStatus;
  startDate: Date;
  endDate: Date;
};

type DeliveryReleaseSeed = {
  projectClientSlug: string;
  projectSlug: string;
  title: string;
  environment: TaskEnvironment;
  status: DeliveryReleaseStatus;
  approvalStatus?: DeliveryReleaseApprovalStatus;
  approvalNotes?: string;
  version?: string;
  releaseNotes?: string;
  scheduledAt?: Date;
  deployedAt?: Date;
};

type ProjectRepositorySeed = {
  projectClientSlug: string;
  projectSlug: string;
  provider: RepositoryProvider;
  owner: string;
  repo: string;
  repositoryUrl: string;
  defaultBranch?: string;
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

type CrmLeadSeed = {
  companyName: string;
  contactName: string;
  contactEmail?: string;
  phone?: string;
  ownerEmail: string;
  source?: CrmLeadSource;
  status: CrmLeadStatus;
  nextFollowUpAt?: Date;
  activities: Array<{
    actorEmail: string;
    type: CrmLeadActivityType;
    note: string;
    nextFollowUpAt?: Date;
  }>;
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
  {
    employeeEmail: "developer@socialtech.com",
    clientSlug: "acme-e-ticaret",
    scope: EmployeeClientAssignmentScope.DEVELOPMENT,
  },
  {
    employeeEmail: "developer@socialtech.com",
    clientSlug: "nova-performance",
    scope: EmployeeClientAssignmentScope.DEVELOPMENT,
  },
  {
    employeeEmail: "developer@socialtech.com",
    clientSlug: "mavi-sosyal",
    scope: EmployeeClientAssignmentScope.DEVELOPMENT,
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
    figmaProjectUrl: "https://www.figma.com/files/project/10001/acme-growth-hub",
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
    title: "Checkout akışındaki ödeme hatasını düzelt",
    description: "Checkout akışında ödeme adımı bazı oturumlarda hata veriyor.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    type: TaskType.BUG,
    workstream: TaskWorkstream.FRONTEND,
    severity: TaskSeverity.CRITICAL,
    environment: TaskEnvironment.PRODUCTION,
    affectedUrl: "https://acme.test/checkout",
    reproductionSteps: "1. Sepete ürün ekle\n2. Ödeme adımına ilerle\n3. Kart alanını doldur ve kaydet",
    reportedBy: "Acme operasyon ekibi",
    code: "DEV-101",
    sprintName: "Sprint Alpha",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-05T00:00:00.000Z"),
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Landing page hero revizyonlarını uygula",
    description: "Revize edilmiş hero alanını ve CTA hiyerarşisini sayfaya uygula.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    type: TaskType.REVISION,
    workstream: TaskWorkstream.FRONTEND,
    environment: TaskEnvironment.STAGING,
    code: "DEV-102",
    sprintName: "Sprint Alpha",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-10T00:00:00.000Z"),
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Sipariş özeti API payloadını genişlet",
    description: "Ödeme öncesi özet ekranı için gerekli alanları backend response'una ekle.",
    status: TaskStatus.REVIEW,
    priority: Priority.MEDIUM,
    type: TaskType.FEATURE,
    workstream: TaskWorkstream.BACKEND,
    environment: TaskEnvironment.STAGING,
    code: "DEV-103",
    sprintName: "Sprint Alpha",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-12T00:00:00.000Z"),
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    title: "Tracking webhook retry mantığını geliştir",
    description: "Düşen tracking eventleri için tekrar deneme kuyruğu ekle.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    type: TaskType.FEATURE,
    workstream: TaskWorkstream.BACKEND,
    environment: TaskEnvironment.PRODUCTION,
    code: "DEV-201",
    sprintName: "Sprint Beta",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-03T00:00:00.000Z"),
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    title: "Rapor ekranı loading sonsuz döngü bugını çöz",
    description: "Dashboard üzerindeki rapor widget'ında state değişimi sonsuz render oluşturuyor.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    type: TaskType.BUG,
    workstream: TaskWorkstream.FULLSTACK,
    severity: TaskSeverity.HIGH,
    environment: TaskEnvironment.STAGING,
    affectedUrl: "https://nova.test/dashboard",
    reproductionSteps: "1. Dashboard aç\n2. Tarih filtresini değiştir\n3. Widget tekrar tekrar yüklenir",
    reportedBy: "Performance ekibi",
    code: "DEV-202",
    sprintName: "Sprint Beta",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-08T00:00:00.000Z"),
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    title: "Staging QA checklistini tamamla",
    description: "Takvim modülü için staging smoke test ve checklist doğrulaması.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    type: TaskType.QA,
    workstream: TaskWorkstream.QA,
    environment: TaskEnvironment.STAGING,
    code: "DEV-301",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-07T00:00:00.000Z"),
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    title: "Mayıs içerik takvimini production'a yayınla",
    description: "Onaylanmış içerik akışını production ortamına geçir ve son kontrolü yap.",
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    type: TaskType.DEPLOYMENT,
    workstream: TaskWorkstream.DEVOPS,
    environment: TaskEnvironment.PRODUCTION,
    code: "DEV-302",
    assigneeEmail: "developer@socialtech.com",
    dueDate: new Date("2026-05-09T00:00:00.000Z"),
  },
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Confirm kickoff scope and milestones",
    description: "Align Acme launch scope, milestone owners, and delivery checkpoints.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    type: TaskType.MAINTENANCE,
    workstream: TaskWorkstream.FULLSTACK,
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
    type: TaskType.FEATURE,
    workstream: TaskWorkstream.BACKEND,
    assigneeEmail: "performance@socialtech.com",
    dueDate: new Date("2026-05-10T00:00:00.000Z"),
  },
];

const DELIVERY_SPRINT_SEEDS: DeliverySprintSeed[] = [
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    name: "Sprint Alpha",
    goal: "Checkout dönüşüm akışını stabil hale getirmek ve landing page revizyonlarını tamamlamak.",
    status: DeliverySprintStatus.ACTIVE,
    startDate: new Date("2026-05-01T00:00:00.000Z"),
    endDate: new Date("2026-05-14T00:00:00.000Z"),
  },
  {
    projectClientSlug: "nova-performance",
    projectSlug: "paid-acquisition-optimization",
    name: "Sprint Beta",
    goal: "Tracking güvenilirliğini ve dashboard stabilitesini artırmak.",
    status: DeliverySprintStatus.ACTIVE,
    startDate: new Date("2026-05-02T00:00:00.000Z"),
    endDate: new Date("2026-05-16T00:00:00.000Z"),
  },
];

const DELIVERY_RELEASE_SEEDS: DeliveryReleaseSeed[] = [
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    title: "Checkout Stabilization Release",
    environment: TaskEnvironment.STAGING,
    status: DeliveryReleaseStatus.TESTING,
    approvalStatus: DeliveryReleaseApprovalStatus.PENDING,
    approvalNotes: "Client QA sign-off bekleniyor.",
    version: "v0.9.4",
    releaseNotes: "Checkout bugfixleri ve landing page revizyonları için test adayı.",
    scheduledAt: new Date("2026-05-12T10:00:00.000Z"),
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    title: "May Calendar Production Release",
    environment: TaskEnvironment.PRODUCTION,
    status: DeliveryReleaseStatus.READY,
    approvalStatus: DeliveryReleaseApprovalStatus.APPROVED,
    approvalNotes: "Project manager deployment onayını verdi.",
    version: "v1.2.0",
    releaseNotes: "İçerik takvimi yayın hazırlığı ve son QA düzeltmeleri.",
    scheduledAt: new Date("2026-05-09T14:00:00.000Z"),
  },
];

const PROJECT_REPOSITORY_SEEDS: ProjectRepositorySeed[] = [
  {
    projectClientSlug: "acme-e-ticaret",
    projectSlug: "growth-hub-launch",
    provider: RepositoryProvider.GITHUB,
    owner: "facebook",
    repo: "react",
    repositoryUrl: "https://github.com/facebook/react",
    defaultBranch: "main",
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
    taskTitle: "Tracking webhook retry mantığını geliştir",
    title: "Publish audit summary for client review",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
    isCompleted: true,
    completedAt: new Date("2026-05-01T10:00:00.000Z"),
    completedByEmail: "performance@socialtech.com",
  },
  {
    projectClientSlug: "mavi-sosyal",
    projectSlug: "social-calendar-refresh",
    taskTitle: "Staging QA checklistini tamamla",
    title: "Upload client-visible draft calendar",
    visibility: TaskTodoVisibility.CLIENT_VISIBLE,
  },
];

const CRM_LEAD_SEEDS: CrmLeadSeed[] = [
  {
    companyName: "Atlas Mobilya",
    contactName: "Ece Arslan",
    contactEmail: "ece@atlasmobilya.com",
    phone: "+90 532 100 10 10",
    ownerEmail: "crm@socialtech.com",
    status: CrmLeadStatus.NEW,
    nextFollowUpAt: new Date("2026-05-03T09:00:00.000Z"),
    activities: [
      {
        actorEmail: "admin@socialtech.com",
        type: CrmLeadActivityType.NOTE,
        note: "Instagram reklam ve landing page ihtiyacı için manuel lead olarak eklendi.",
      },
    ],
  },
  {
    companyName: "Vega Klinik",
    contactName: "Dr. Mert Kaya",
    contactEmail: "mert@vegaklinik.com",
    phone: "+90 532 200 20 20",
    ownerEmail: "crm@socialtech.com",
    status: CrmLeadStatus.CONTACTED,
    nextFollowUpAt: new Date("2026-05-04T11:00:00.000Z"),
    activities: [
      {
        actorEmail: "crm@socialtech.com",
        type: CrmLeadActivityType.CALL,
        note: "İlk görüşme yapıldı; Meta Ads ve SEO Audit ilgisi var.",
        nextFollowUpAt: new Date("2026-05-04T11:00:00.000Z"),
      },
    ],
  },
  {
    companyName: "Luna Kids",
    contactName: "Selin Aksoy",
    contactEmail: "selin@lunakids.com",
    phone: "+90 532 300 30 30",
    ownerEmail: "crm@socialtech.com",
    status: CrmLeadStatus.FOLLOW_UP,
    nextFollowUpAt: new Date("2026-05-02T15:00:00.000Z"),
    activities: [
      {
        actorEmail: "crm@socialtech.com",
        type: CrmLeadActivityType.WHATSAPP,
        note: "Katalog ve mevcut reklam hesabı ekran görüntüleri istendi.",
        nextFollowUpAt: new Date("2026-05-02T15:00:00.000Z"),
      },
    ],
  },
  {
    companyName: "Orion B2B",
    contactName: "Burak Tunca",
    contactEmail: "burak@orionb2b.com",
    phone: "+90 532 400 40 40",
    ownerEmail: "crm-backup@socialtech.com",
    status: CrmLeadStatus.QUALIFIED,
    nextFollowUpAt: new Date("2026-05-05T13:00:00.000Z"),
    activities: [
      {
        actorEmail: "crm-backup@socialtech.com",
        type: CrmLeadActivityType.EMAIL,
        note: "Kurumsal web app ve CRM entegrasyonu için brief alındı.",
        nextFollowUpAt: new Date("2026-05-05T13:00:00.000Z"),
      },
    ],
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
  { slug: "projects.manage.assigned", description: "Create and update assigned client projects." },
  { slug: "projects.read.own", description: "Read own client projects." },
  { slug: "tasks.read", description: "Read tasks." },
  { slug: "tasks.manage", description: "Manage all tasks." },
  { slug: "tasks.read.any", description: "Read all project tasks." },
  { slug: "tasks.manage.any", description: "Create and update all project tasks." },
  { slug: "tasks.read.assigned", description: "Read assigned tasks." },
  { slug: "tasks.manage.assigned", description: "Create and update tasks in assigned projects." },
  { slug: "tasks.assign.assigned", description: "Assign tasks in assigned projects." },
  { slug: "tasks.todos.manage.assigned", description: "Manage task todos in assigned projects." },
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
  { slug: "crm.leads.read.any", description: "Read all CRM leads." },
  { slug: "crm.leads.manage.any", description: "Create and manage all CRM leads." },
  { slug: "crm.leads.read.assigned", description: "Read assigned CRM leads." },
  { slug: "crm.leads.update.assigned", description: "Update assigned CRM leads." },
  { slug: "crm.leads.convert", description: "Convert CRM leads to client profiles." },
  { slug: "crm.leadScan.read", description: "Read CRM lead scan logs." },
  { slug: "crm.leadScan.run", description: "Run CRM lead scans." },
  { slug: "metaAds.config.read.any", description: "Read all Meta Ads configurations." },
  { slug: "metaAds.config.manage.any", description: "Create and manage all Meta Ads configurations." },
  { slug: "metaAds.config.read.assigned", description: "Read Meta Ads configurations in assigned scope." },
  { slug: "metaAds.config.read.own", description: "Read own Meta Ads configuration." },
  { slug: "metaAds.reporting.read.assigned", description: "Read Meta Ads reports in assigned scope." },
  { slug: "metaAds.notes.manage.assigned", description: "Create and manage Meta Ads workspace notes in assigned scope." },
  { slug: "metaAds.approvals.create.assigned", description: "Create Meta Ads approval requests in assigned scope." },
  { slug: "metaAds.creatives.manage.assigned", description: "Manage Meta Ads creative assets in assigned scope." },
  { slug: "metaAds.sync.read.assigned", description: "Trigger/read Meta Ads sync operations in assigned scope." },
  { slug: "metaAds.reporting.read.any", description: "Read all Meta Ads reports for any client." },
  { slug: "metaAds.sync.run.any", description: "Trigger Meta Ads sync operations for any client." },
  { slug: "metaAds.approvals.manage.any", description: "Manage all Meta Ads approval requests." },
  { slug: "tiktokAds.config.read.any", description: "Read all TikTok Ads configurations." },
  { slug: "tiktokAds.config.manage.any", description: "Create and manage all TikTok Ads configurations." },
  { slug: "tiktokAds.config.read.assigned", description: "Read TikTok Ads configurations in assigned scope." },
  { slug: "tiktokAds.config.read.own", description: "Read own TikTok Ads configuration." },
  { slug: "tiktokAds.reporting.read.any", description: "Read all TikTok Ads reports for any client." },
  { slug: "tiktokAds.reporting.read.assigned", description: "Read TikTok Ads reports in assigned scope." },
  { slug: "tiktokAds.reporting.read.own", description: "Read own TikTok Ads reports." },
  { slug: "tiktokAds.notes.manage.assigned", description: "Create and manage TikTok Ads report notes in assigned scope." },
  { slug: "tiktokAds.approvals.create.assigned", description: "Create TikTok Ads approval requests in assigned scope." },
  { slug: "tiktokAds.creatives.manage.assigned", description: "Manage TikTok Ads creative assets in assigned scope." },
  { slug: "tiktokAds.sync.read.assigned", description: "Trigger/read TikTok Ads sync operations in assigned scope." },
  { slug: "tiktokAds.sync.run.any", description: "Trigger TikTok Ads sync operations for any client." },
  { slug: "tiktokAds.approvals.manage.any", description: "Manage all TikTok Ads approval requests." },
  { slug: "delivery.sprints.read.assigned", description: "Read delivery sprints in assigned scope." },
  { slug: "delivery.sprints.manage.assigned", description: "Manage delivery sprints in assigned scope." },
  { slug: "delivery.sprints.manage.any", description: "Manage all delivery sprints." },
  { slug: "delivery.releases.read.assigned", description: "Read delivery releases in assigned scope." },
  { slug: "delivery.releases.manage.assigned", description: "Manage delivery releases in assigned scope." },
  { slug: "delivery.releases.manage.any", description: "Manage all delivery releases." },
  { slug: "delivery.summary.read.assigned", description: "Read delivery dashboard summary in assigned scope." },
  { slug: "integrations.github.read.assigned", description: "Read GitHub repository data in assigned scope." },
  { slug: "integrations.github.read.any", description: "Read any project GitHub repository data." },
  { slug: "integrations.github.manage.any", description: "Manage any project GitHub repository connection." },
  { slug: "projects.files.read.assigned", description: "Read project files in assigned scope." },
  { slug: "projects.files.manage.assigned", description: "Manage project files in assigned scope." },
  { slug: "projects.files.manage.any", description: "Manage any project files." },
  { slug: "projects.files.share.assigned", description: "Create/revoke project file share links in assigned scope." },
  { slug: "projects.files.read.own", description: "Read own client project files." },
  { slug: "webapp.workspace.read.any", description: "Read any web-app workspace." },
  { slug: "webapp.workspace.manage.any", description: "Manage any web-app workspace." },
  { slug: "webapp.workspace.read.assigned", description: "Read assigned web-app workspaces." },
  { slug: "webapp.workspace.manage.assigned", description: "Manage assigned web-app workspaces." },
  { slug: "webapp.workspace.interact.assigned", description: "Interact with assigned web-app workspaces." },
  { slug: "webapp.workspace.read.own", description: "Read own client web-app workspace." },
  { slug: "webapp.workspace.interact.own", description: "Interact with own client web-app workspace." },
];

const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  ADMIN: PERMISSIONS.map((permission) => permission.slug),
  PROJECT_MANAGER: [
    "dashboard.read",
    "clients.read.assigned",
    "metaAds.config.read.assigned",
    "tiktokAds.config.read.assigned",
    "metaAds.reporting.read.assigned",
    "tiktokAds.reporting.read.assigned",
    "metaAds.notes.manage.assigned",
    "tiktokAds.notes.manage.assigned",
    "metaAds.approvals.create.assigned",
    "metaAds.creatives.manage.assigned",
    "tiktokAds.approvals.create.assigned",
    "tiktokAds.creatives.manage.assigned",
    "metaAds.sync.read.assigned",
    "tiktokAds.sync.read.assigned",
    "projects.read.assigned",
    "projects.manage.assigned",
    "tasks.read.assigned",
    "tasks.manage.assigned",
    "tasks.assign.assigned",
    "tasks.todos.manage.assigned",
    "tasks.update.assigned",
    "delivery.sprints.read.assigned",
    "delivery.sprints.manage.assigned",
    "delivery.releases.read.assigned",
    "delivery.releases.manage.assigned",
    "delivery.summary.read.assigned",
    "integrations.github.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.interact.assigned",
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
    "metaAds.config.read.assigned",
    "tiktokAds.config.read.assigned",
    "metaAds.reporting.read.assigned",
    "tiktokAds.reporting.read.assigned",
    "metaAds.notes.manage.assigned",
    "tiktokAds.notes.manage.assigned",
    "metaAds.approvals.create.assigned",
    "tiktokAds.approvals.create.assigned",
    "metaAds.sync.read.assigned",
    "tiktokAds.sync.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.interact.assigned",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  SOCIAL_MEDIA_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "metaAds.config.read.assigned",
    "tiktokAds.config.read.assigned",
    "metaAds.reporting.read.assigned",
    "tiktokAds.reporting.read.assigned",
    "metaAds.notes.manage.assigned",
    "tiktokAds.notes.manage.assigned",
    "metaAds.approvals.create.assigned",
    "tiktokAds.approvals.create.assigned",
    "metaAds.sync.read.assigned",
    "tiktokAds.sync.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.interact.assigned",
    "approvals.read",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  DESIGNER: [
    "dashboard.read",
    "clients.read.assigned",
    "metaAds.config.read.assigned",
    "tiktokAds.config.read.assigned",
    "metaAds.reporting.read.assigned",
    "tiktokAds.reporting.read.assigned",
    "metaAds.approvals.create.assigned",
    "metaAds.creatives.manage.assigned",
    "tiktokAds.approvals.create.assigned",
    "tiktokAds.creatives.manage.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.interact.assigned",
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
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "integrations.github.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.manage.assigned",
    "webapp.workspace.interact.assigned",
    "settings.read",
  ],
  SUPPORT_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.interact.assigned",
    "settings.read",
  ],
  SEO_SPECIALIST: [
    "dashboard.read",
    "clients.read.assigned",
    "projects.read.assigned",
    "tasks.read.assigned",
    "tasks.update.assigned",
    "tasks.update.own",
    "delivery.sprints.read.assigned",
    "delivery.releases.read.assigned",
    "delivery.summary.read.assigned",
    "projects.files.read.assigned",
    "projects.files.manage.assigned",
    "projects.files.share.assigned",
    "webapp.workspace.read.assigned",
    "webapp.workspace.interact.assigned",
    "reports.read",
    "reports.manage",
    "settings.read",
  ],
  CRM_SPECIALIST: [
    "dashboard.read",
    "crm.leads.read.assigned",
    "crm.leads.update.assigned",
    "settings.read",
  ],
  CLIENT_OWNER: [
    "portal.read.own",
    "clients.read.own",
    "metaAds.config.read.own",
    "tiktokAds.config.read.own",
    "tiktokAds.reporting.read.own",
    "projects.read.own",
    "tasks.read.own",
    "projects.files.read.own",
    "webapp.workspace.read.own",
    "webapp.workspace.interact.own",
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
    "metaAds.config.read.own",
    "tiktokAds.config.read.own",
    "tiktokAds.reporting.read.own",
    "projects.read.own",
    "tasks.read.own",
    "projects.files.read.own",
    "webapp.workspace.read.own",
    "webapp.workspace.interact.own",
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
    email: "crm@socialtech.com",
    displayName: "CRM / Satış Uzmanı",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.CRM_SPECIALIST,
  },
  {
    email: "crm-backup@socialtech.com",
    displayName: "CRM / Satış Uzmanı 2",
    accountType: AccountType.EMPLOYEE,
    role: UserRole.CRM_SPECIALIST,
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

  await ensureAdminCoreProjectPermissions(permissionIdBySlug);
}

async function ensureAdminCoreProjectPermissions(
  permissionIdBySlug: Map<string, string>,
): Promise<void> {
  const requiredAdminPermissionSlugs = [
    "projects.read.any",
    "projects.manage.any",
    "projects.files.manage.any",
  ] as const;

  const permissionIds = requiredAdminPermissionSlugs
    .map((slug) => permissionIdBySlug.get(slug))
    .filter((value): value is string => Boolean(value));

  if (permissionIds.length === 0) {
    return;
  }

  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({
      role: UserRole.ADMIN,
      permissionId,
    })),
    skipDuplicates: true,
  });
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

function sprintSeedKey(clientSlug: string, projectSlug: string, sprintName: string): string {
  return `${clientSlug}:${projectSlug}:${sprintName}`;
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
        figmaProjectUrl: project.figmaProjectUrl ?? null,
        repositoryUrl: project.repositoryUrl ?? null,
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
        figmaProjectUrl: project.figmaProjectUrl ?? null,
        repositoryUrl: project.repositoryUrl ?? null,
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

async function seedDeliverySprints(projectIdByKey: Map<string, string>): Promise<Map<string, string>> {
  const sprintIdByKey = new Map<string, string>();

  for (const sprint of DELIVERY_SPRINT_SEEDS) {
    const projectId = projectIdByKey.get(projectSeedKey(sprint.projectClientSlug, sprint.projectSlug));
    if (!projectId) {
      throw new Error(`Missing project for sprint seed: ${sprint.projectClientSlug}/${sprint.projectSlug}`);
    }

    const existing = await prisma.deliverySprint.findFirst({
      where: {
        projectId,
        name: sprint.name,
      },
      select: { id: true },
    });

    const result = existing
      ? await prisma.deliverySprint.update({
          where: { id: existing.id },
          data: {
            goal: sprint.goal ?? null,
            status: sprint.status,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
          },
          select: { id: true },
        })
      : await prisma.deliverySprint.create({
          data: {
            projectId,
            name: sprint.name,
            goal: sprint.goal ?? null,
            status: sprint.status,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
          },
          select: { id: true },
        });

    sprintIdByKey.set(
      sprintSeedKey(sprint.projectClientSlug, sprint.projectSlug, sprint.name),
      result.id,
    );
  }

  return sprintIdByKey;
}

async function seedDeliveryReleases(projectIdByKey: Map<string, string>): Promise<void> {
  for (const release of DELIVERY_RELEASE_SEEDS) {
    const projectId = projectIdByKey.get(projectSeedKey(release.projectClientSlug, release.projectSlug));
    if (!projectId) {
      throw new Error(`Missing project for release seed: ${release.projectClientSlug}/${release.projectSlug}`);
    }

    const existing = await prisma.deliveryRelease.findFirst({
      where: {
        projectId,
        title: release.title,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.deliveryRelease.update({
        where: { id: existing.id },
        data: {
          environment: release.environment,
          status: release.status,
          approvalStatus: release.approvalStatus ?? DeliveryReleaseApprovalStatus.NOT_REQUESTED,
          approvalNotes: release.approvalNotes ?? null,
          version: release.version ?? null,
          releaseNotes: release.releaseNotes ?? null,
          scheduledAt: release.scheduledAt ?? null,
          deployedAt: release.deployedAt ?? null,
        },
      });
      continue;
    }

    await prisma.deliveryRelease.create({
      data: {
        projectId,
        title: release.title,
        environment: release.environment,
        status: release.status,
        approvalStatus: release.approvalStatus ?? DeliveryReleaseApprovalStatus.NOT_REQUESTED,
        approvalNotes: release.approvalNotes ?? null,
        version: release.version ?? null,
        releaseNotes: release.releaseNotes ?? null,
        scheduledAt: release.scheduledAt ?? null,
        deployedAt: release.deployedAt ?? null,
      },
    });
  }
}

async function seedProjectRepositories(projectIdByKey: Map<string, string>): Promise<void> {
  for (const repository of PROJECT_REPOSITORY_SEEDS) {
    const projectId = projectIdByKey.get(
      projectSeedKey(repository.projectClientSlug, repository.projectSlug),
    );
    if (!projectId) {
      throw new Error(
        `Missing project for repository seed: ${repository.projectClientSlug}/${repository.projectSlug}`,
      );
    }

    await prisma.projectRepository.upsert({
      where: { projectId },
      update: {
        provider: repository.provider,
        owner: repository.owner,
        repo: repository.repo,
        repositoryUrl: repository.repositoryUrl,
        defaultBranch: repository.defaultBranch ?? null,
        isActive: true,
      },
      create: {
        projectId,
        provider: repository.provider,
        owner: repository.owner,
        repo: repository.repo,
        repositoryUrl: repository.repositoryUrl,
        defaultBranch: repository.defaultBranch ?? null,
        isActive: true,
      },
    });
  }
}

async function seedTasks(
  projectIdByKey: Map<string, string>,
  sprintIdByKey: Map<string, string>,
): Promise<void> {
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

    const sprintId = task.sprintName
      ? sprintIdByKey.get(sprintSeedKey(task.projectClientSlug, task.projectSlug, task.sprintName))
      : null;

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
          type: task.type ?? TaskType.FEATURE,
          workstream: task.workstream ?? TaskWorkstream.FULLSTACK,
          severity: task.severity ?? null,
          environment: task.environment ?? null,
          affectedUrl: task.affectedUrl ?? null,
          reproductionSteps: task.reproductionSteps ?? null,
          reportedBy: task.reportedBy ?? null,
          code: task.code ?? null,
          sprintId: sprintId ?? null,
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
        type: task.type ?? TaskType.FEATURE,
        workstream: task.workstream ?? TaskWorkstream.FULLSTACK,
        severity: task.severity ?? null,
        environment: task.environment ?? null,
        affectedUrl: task.affectedUrl ?? null,
        reproductionSteps: task.reproductionSteps ?? null,
        reportedBy: task.reportedBy ?? null,
        code: task.code ?? null,
        sprintId: sprintId ?? null,
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

async function seedCrmLeads(): Promise<void> {
  const userEmails = Array.from(
    new Set(
      CRM_LEAD_SEEDS.flatMap((lead) => [
        lead.ownerEmail,
        ...lead.activities.map((activity) => activity.actorEmail),
      ]),
    ),
  );
  const users = await prisma.user.findMany({
    where: { email: { in: userEmails } },
    select: {
      id: true,
      email: true,
    },
  });
  const userByEmail = new Map(users.map((user) => [user.email, user]));

  for (const lead of CRM_LEAD_SEEDS) {
    const owner = userByEmail.get(lead.ownerEmail);
    if (!owner) {
      throw new Error(`Missing CRM lead owner user: ${lead.ownerEmail}`);
    }

    const existingLead = await prisma.crmLead.findFirst({
      where: {
        companyName: lead.companyName,
        contactName: lead.contactName,
      },
      select: { id: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const crmLead = existingLead
      ? await prisma.crmLead.update({
          where: { id: existingLead.id },
          data: {
            contactEmail: lead.contactEmail ?? null,
            phone: lead.phone ?? null,
            ownerUserId: owner.id,
            source: lead.source ?? CrmLeadSource.MANUAL,
            status: lead.status,
            nextFollowUpAt: lead.nextFollowUpAt ?? null,
          },
          select: { id: true },
        })
      : await prisma.crmLead.create({
          data: {
            companyName: lead.companyName,
            contactName: lead.contactName,
            contactEmail: lead.contactEmail ?? null,
            phone: lead.phone ?? null,
            ownerUserId: owner.id,
            source: lead.source ?? CrmLeadSource.MANUAL,
            status: lead.status,
            nextFollowUpAt: lead.nextFollowUpAt ?? null,
          },
          select: { id: true },
        });

    await prisma.crmLeadActivity.deleteMany({
      where: { leadId: crmLead.id },
    });

    await prisma.crmLeadActivity.createMany({
      data: lead.activities.map((activity) => {
        const actor = userByEmail.get(activity.actorEmail);
        if (!actor) {
          throw new Error(`Missing CRM activity actor user: ${activity.actorEmail}`);
        }

        return {
          leadId: crmLead.id,
          actorUserId: actor.id,
          type: activity.type,
          note: activity.note,
          nextFollowUpAt: activity.nextFollowUpAt ?? null,
        };
      }),
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
  const sprintIdByKey = await seedDeliverySprints(projectIdByKey);
  await seedDeliveryReleases(projectIdByKey);
  await seedProjectRepositories(projectIdByKey);
  await seedTasks(projectIdByKey, sprintIdByKey);
  await seedTaskTodos(projectIdByKey);
  await seedCrmLeads();
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

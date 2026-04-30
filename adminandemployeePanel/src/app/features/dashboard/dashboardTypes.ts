export type AdminSummaryUsers = {
  total: number;
  active: number;
  inactive: number;
  employees: number;
  clients: number;
  admins: number;
};

export type AdminSummaryClients = {
  total: number;
  active: number;
  inactive: number;
};

export type AdminSummaryProjects = {
  total: number;
  planned: number;
  inProgress: number;
  review: number;
  completed: number;
  onHold: number;
};

export type AdminSummaryTasks = {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  blocked: number;
};

export type AdminSummaryAuditLogs = {
  total: number;
  lastActionAt: string | null;
};

export type AdminSummaryResponse = {
  users: AdminSummaryUsers;
  clients: AdminSummaryClients;
  projects: AdminSummaryProjects;
  tasks: AdminSummaryTasks;
  auditLogs: AdminSummaryAuditLogs;
  meta: {
    generatedAt: string;
  };
};

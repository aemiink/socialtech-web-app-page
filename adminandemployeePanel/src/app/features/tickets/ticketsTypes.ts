export type ClientTicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "CLOSED";
export type ClientTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ClientTicketAuthor = {
  id: string;
  displayName?: string | null;
  role?: string | null;
  accountType?: string | null;
};

export type ClientTicketMessage = {
  id: string;
  ticketId: string;
  authorUserId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author?: ClientTicketAuthor | null;
};

export type ClientTicket = {
  id: string;
  clientProfileId: string;
  projectId?: string | null;
  serviceKey?: string | null;
  title: string;
  description: string;
  status: ClientTicketStatus;
  priority: ClientTicketPriority;
  createdByUserId: string;
  lastMessageAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  clientProfile?: {
    id: string;
    companyName: string;
    slug?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    serviceKey?: string | null;
  } | null;
  createdBy?: ClientTicketAuthor | null;
  messages: ClientTicketMessage[];
};

export type ClientTicketsListQuery = {
  clientId: string;
  projectId?: string;
  serviceKey?: string;
  status?: ClientTicketStatus;
};

export type AddClientTicketMessageRequest = {
  ticketId: string;
  body: string;
  isInternal?: boolean;
};

export type UpdateClientTicketRequest = {
  ticketId: string;
  status?: ClientTicketStatus;
  priority?: ClientTicketPriority;
};

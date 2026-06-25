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
  project?: {
    id: string;
    name: string;
    serviceKey?: string | null;
  } | null;
  messages: ClientTicketMessage[];
};

export type CreateClientTicketRequest = {
  title: string;
  description: string;
  projectId?: string | null;
  serviceKey?: string | null;
  priority?: ClientTicketPriority;
};

export type AddClientTicketMessageRequest = {
  ticketId: string;
  body: string;
};

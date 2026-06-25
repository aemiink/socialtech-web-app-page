import { baseApi } from "../../services/baseApi";
import type {
  AddClientTicketMessageRequest,
  ClientTicket,
  CreateClientTicketRequest,
} from "./ticketsTypes";

const OWN_TICKETS_ID = "OWN";

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOwnTickets: builder.query<ClientTicket[], void>({
      query: () => ({
        url: "/clients/me/tickets",
        method: "GET",
      }),
      providesTags: (result) => [
        { type: "ClientTickets", id: OWN_TICKETS_ID },
        ...(result ?? []).map((ticket) => ({ type: "ClientTickets" as const, id: ticket.id })),
      ],
    }),
    createOwnTicket: builder.mutation<ClientTicket, CreateClientTicketRequest>({
      query: (body) => ({
        url: "/clients/me/tickets",
        method: "POST",
        body: serializeCreateTicketBody(body),
      }),
      invalidatesTags: [{ type: "ClientTickets", id: OWN_TICKETS_ID }],
    }),
    addOwnTicketMessage: builder.mutation<ClientTicket, AddClientTicketMessageRequest>({
      query: ({ ticketId, body }) => ({
        url: `/clients/me/tickets/${ticketId}/messages`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: "ClientTickets", id: OWN_TICKETS_ID },
        { type: "ClientTickets", id: ticketId },
      ],
    }),
  }),
});

export const {
  useGetOwnTicketsQuery,
  useCreateOwnTicketMutation,
  useAddOwnTicketMessageMutation,
} = ticketsApi;

function serializeCreateTicketBody(body: CreateClientTicketRequest) {
  return {
    title: body.title,
    description: body.description,
    ...(body.projectId ? { projectId: body.projectId } : {}),
    ...(body.serviceKey ? { serviceKey: toBackendServiceKey(body.serviceKey) } : {}),
    ...(body.priority ? { priority: body.priority } : {}),
  };
}

function toBackendServiceKey(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  if (normalized === "landing-pages") {
    return "LANDING_PAGE";
  }
  return normalized.toUpperCase().replace(/-/g, "_");
}

import { baseApi } from "../../services/baseApi";
import type {
  AddClientTicketMessageRequest,
  ClientTicket,
  ClientTicketsListQuery,
  UpdateClientTicketRequest,
} from "./ticketsTypes";

const TICKETS_INBOX_ID = "INBOX";

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignedTicketInbox: builder.query<ClientTicket[], void>({
      query: () => ({
        url: "/tickets/inbox",
        method: "GET",
      }),
      providesTags: [{ type: "ClientTickets", id: TICKETS_INBOX_ID }],
    }),
    getAssignedClientTickets: builder.query<ClientTicket[], ClientTicketsListQuery>({
      query: ({ clientId, ...params }) => ({
        url: `/tickets/clients/${clientId}`,
        method: "GET",
        params,
      }),
      providesTags: (result, _error, { clientId }) => [
        { type: "ClientTickets", id: `CLIENT:${clientId}` },
        ...(result ?? []).map((ticket) => ({ type: "ClientTickets" as const, id: ticket.id })),
      ],
    }),
    addAssignedTicketMessage: builder.mutation<ClientTicket, AddClientTicketMessageRequest>({
      query: ({ ticketId, body, isInternal }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: "POST",
        body: { body, isInternal },
      }),
      invalidatesTags: (result, _error, { ticketId }) => [
        { type: "ClientTickets", id: ticketId },
        { type: "ClientTickets", id: TICKETS_INBOX_ID },
        ...(result?.clientProfileId
          ? [{ type: "ClientTickets" as const, id: `CLIENT:${result.clientProfileId}` }]
          : []),
      ],
    }),
    updateAssignedTicket: builder.mutation<ClientTicket, UpdateClientTicketRequest>({
      query: ({ ticketId, ...body }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _error, { ticketId }) => [
        { type: "ClientTickets", id: ticketId },
        { type: "ClientTickets", id: TICKETS_INBOX_ID },
        ...(result?.clientProfileId
          ? [{ type: "ClientTickets" as const, id: `CLIENT:${result.clientProfileId}` }]
          : []),
      ],
    }),
  }),
});

export const {
  useGetAssignedTicketInboxQuery,
  useGetAssignedClientTicketsQuery,
  useAddAssignedTicketMessageMutation,
  useUpdateAssignedTicketMutation,
} = ticketsApi;

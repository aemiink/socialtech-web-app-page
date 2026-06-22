import { baseApi } from "../../services/baseApi";
import type { ClientInvoice, CreateInvoiceRequest, UpdateInvoiceRequest } from "./billingTypes";

const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listInvoices: builder.query<ClientInvoice[], string>({
      query: (clientId) => `admin/clients/${clientId}/invoices`,
      providesTags: (_result, _err, clientId) => [{ type: "ClientInvoices", id: clientId }],
    }),

    createInvoice: builder.mutation<ClientInvoice, { clientId: string; data: CreateInvoiceRequest }>({
      query: ({ clientId, data }) => ({
        url: `admin/clients/${clientId}/invoices`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _err, { clientId }) => [{ type: "ClientInvoices", id: clientId }],
    }),

    updateInvoice: builder.mutation<
      ClientInvoice,
      { clientId: string; invoiceId: string; data: UpdateInvoiceRequest }
    >({
      query: ({ clientId, invoiceId, data }) => ({
        url: `admin/clients/${clientId}/invoices/${invoiceId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _err, { clientId }) => [{ type: "ClientInvoices", id: clientId }],
    }),

    deleteInvoice: builder.mutation<{ success: boolean }, { clientId: string; invoiceId: string }>({
      query: ({ clientId, invoiceId }) => ({
        url: `admin/clients/${clientId}/invoices/${invoiceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, { clientId }) => [{ type: "ClientInvoices", id: clientId }],
    }),
  }),
});

export const {
  useListInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = billingApi;

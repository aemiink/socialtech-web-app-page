import { baseApi } from "../../services/baseApi";
import type { ClientInvoice } from "./billingTypes";

const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyInvoices: builder.query<ClientInvoice[], void>({
      query: () => "clients/me/invoices",
      providesTags: ["ClientInvoices"],
    }),
  }),
});

export const { useGetMyInvoicesQuery } = billingApi;

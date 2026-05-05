import { baseApi } from "../../services/baseApi";
import type {
  CreateDeliveryReleaseRequest,
  CreateDeliverySprintRequest,
  DeliveryRelease,
  DeliveryReleaseQuery,
  DeliveryReleasesResponse,
  DeliverySprint,
  DeliverySprintQuery,
  DeliverySprintsResponse,
  DeliverySummary,
  UpdateDeliveryReleaseRequest,
  UpdateDeliverySprintRequest,
} from "./deliveryTypes";
import {
  normalizeDeliveryReleasesResponse,
  normalizeDeliverySprintsResponse,
  normalizeDeliverySummaryResponse,
} from "./deliveryUtils";

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliverySprints: builder.query<DeliverySprintsResponse, DeliverySprintQuery | void>({
      query: (query) => ({
        url: "/delivery/sprints",
        method: "GET",
        params: query ?? undefined,
      }),
      transformResponse: (response: unknown) => normalizeDeliverySprintsResponse(response),
    }),
    getDeliverySprint: builder.query<DeliverySprint, string>({
      query: (id) => ({
        url: `/delivery/sprints/${id}`,
        method: "GET",
      }),
    }),
    createDeliverySprint: builder.mutation<DeliverySprint, CreateDeliverySprintRequest>({
      query: (body) => ({
        url: "/delivery/sprints",
        method: "POST",
        body,
      }),
    }),
    updateDeliverySprint: builder.mutation<
      DeliverySprint,
      { id: string; body: UpdateDeliverySprintRequest }
    >({
      query: ({ id, body }) => ({
        url: `/delivery/sprints/${id}`,
        method: "PATCH",
        body,
      }),
    }),
    getDeliveryReleases: builder.query<DeliveryReleasesResponse, DeliveryReleaseQuery | void>({
      query: (query) => ({
        url: "/delivery/releases",
        method: "GET",
        params: query ?? undefined,
      }),
      transformResponse: (response: unknown) => normalizeDeliveryReleasesResponse(response),
    }),
    getDeliveryRelease: builder.query<DeliveryRelease, string>({
      query: (id) => ({
        url: `/delivery/releases/${id}`,
        method: "GET",
      }),
    }),
    createDeliveryRelease: builder.mutation<DeliveryRelease, CreateDeliveryReleaseRequest>({
      query: (body) => ({
        url: "/delivery/releases",
        method: "POST",
        body,
      }),
    }),
    updateDeliveryRelease: builder.mutation<
      DeliveryRelease,
      { id: string; body: UpdateDeliveryReleaseRequest }
    >({
      query: ({ id, body }) => ({
        url: `/delivery/releases/${id}`,
        method: "PATCH",
        body,
      }),
    }),
    getDeliverySummary: builder.query<DeliverySummary, void>({
      query: () => ({
        url: "/delivery/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeDeliverySummaryResponse(response),
    }),
  }),
});

export const {
  useGetDeliverySprintsQuery,
  useGetDeliverySprintQuery,
  useCreateDeliverySprintMutation,
  useUpdateDeliverySprintMutation,
  useGetDeliveryReleasesQuery,
  useGetDeliveryReleaseQuery,
  useCreateDeliveryReleaseMutation,
  useUpdateDeliveryReleaseMutation,
  useGetDeliverySummaryQuery,
} = deliveryApi;

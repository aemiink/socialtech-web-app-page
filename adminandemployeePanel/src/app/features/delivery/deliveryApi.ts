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

const DELIVERY_SPRINTS_LIST_ID = "LIST";
const DELIVERY_RELEASES_LIST_ID = "LIST";
const DELIVERY_SUMMARY_ID = "SUMMARY";

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeliverySprints: builder.query<DeliverySprintsResponse, DeliverySprintQuery | void>({
      query: (query) => ({
        url: "/delivery/sprints",
        method: "GET",
        params: query ?? undefined,
      }),
      transformResponse: (response: unknown) => normalizeDeliverySprintsResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID }];
        }

        return [
          { type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID },
          ...result.data.map((sprint) => ({ type: "DeliverySprints" as const, id: sprint.id })),
        ];
      },
    }),
    getDeliverySprint: builder.query<DeliverySprint, string>({
      query: (id) => ({
        url: `/delivery/sprints/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "DeliverySprints", id }],
    }),
    createDeliverySprint: builder.mutation<DeliverySprint, CreateDeliverySprintRequest>({
      query: (body) => ({
        url: "/delivery/sprints",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        { type: "Projects", id: body.projectId },
      ],
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
      invalidatesTags: (result, _error, { id }) => [
        { type: "DeliverySprints", id: DELIVERY_SPRINTS_LIST_ID },
        { type: "DeliverySprints", id },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        ...(result ? [{ type: "Projects" as const, id: result.projectId }] : []),
      ],
    }),
    getDeliveryReleases: builder.query<DeliveryReleasesResponse, DeliveryReleaseQuery | void>({
      query: (query) => ({
        url: "/delivery/releases",
        method: "GET",
        params: query ?? undefined,
      }),
      transformResponse: (response: unknown) => normalizeDeliveryReleasesResponse(response),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "DeliveryReleases", id: DELIVERY_RELEASES_LIST_ID }];
        }

        return [
          { type: "DeliveryReleases", id: DELIVERY_RELEASES_LIST_ID },
          ...result.data.map((release) => ({ type: "DeliveryReleases" as const, id: release.id })),
        ];
      },
    }),
    getDeliveryRelease: builder.query<DeliveryRelease, string>({
      query: (id) => ({
        url: `/delivery/releases/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "DeliveryReleases", id }],
    }),
    createDeliveryRelease: builder.mutation<DeliveryRelease, CreateDeliveryReleaseRequest>({
      query: (body) => ({
        url: "/delivery/releases",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: "DeliveryReleases", id: DELIVERY_RELEASES_LIST_ID },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        { type: "Projects", id: body.projectId },
      ],
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
      invalidatesTags: (result, _error, { id }) => [
        { type: "DeliveryReleases", id: DELIVERY_RELEASES_LIST_ID },
        { type: "DeliveryReleases", id },
        { type: "DeliverySummary", id: DELIVERY_SUMMARY_ID },
        ...(result ? [{ type: "Projects" as const, id: result.projectId }] : []),
      ],
    }),
    getDeliverySummary: builder.query<DeliverySummary, void>({
      query: () => ({
        url: "/delivery/summary",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeDeliverySummaryResponse(response),
      providesTags: [{ type: "DeliverySummary", id: DELIVERY_SUMMARY_ID }],
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

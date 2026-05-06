import { describe, expect, it } from "vitest";
import {
  normalizeClientApprovalListResponse,
  serializeClientApprovalListQuery,
} from "../clientApprovalsApi";

describe("client clientApprovalsApi helpers", () => {
  it("serializes trimmed client approval list filters", () => {
    expect(
      serializeClientApprovalListQuery({
        page: 3,
        limit: 10,
        status: "PENDING",
        type: "INFORMATION",
        projectId: "  project-55  ",
        search: "  pending brief  ",
      }),
    ).toEqual({
      page: 3,
      limit: 10,
      status: "PENDING",
      type: "INFORMATION",
      projectId: "project-55",
      search: "pending brief",
    });
  });

  it("normalizes approval payload lists without losing sanitized actionPayload", () => {
    const normalized = normalizeClientApprovalListResponse({
      data: [
        {
          id: "approval-1",
          clientProfileId: "client-1",
          projectId: "project-1",
          type: "FILE_APPROVAL",
          status: "PENDING",
          title: "Preview asset",
          message: "Please review the latest design preview.",
          actionPayload: {
            previewUrl: "https://cdn.example.com/preview.png",
          },
          createdAt: "2026-05-06T10:00:00.000Z",
          updatedAt: "2026-05-06T10:00:00.000Z",
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(normalized.data[0]?.actionPayload).toEqual({
      previewUrl: "https://cdn.example.com/preview.png",
    });
    expect(normalized.meta.total).toBe(1);
  });
});

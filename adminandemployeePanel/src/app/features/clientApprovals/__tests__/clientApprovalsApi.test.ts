import { describe, expect, it } from "vitest";
import {
  normalizeAdminClientApprovalListResponse,
  serializeClientApprovalListQuery,
} from "../clientApprovalsApi";

describe("admin clientApprovalsApi helpers", () => {
  it("serializes only meaningful approval list query params", () => {
    expect(
      serializeClientApprovalListQuery({
        page: 2,
        limit: 50,
        status: "PENDING",
        projectId: "  project-1  ",
        clientProfileId: "   ",
        assignedToUserId: "  user-9 ",
        search: "  hero approval  ",
      }),
    ).toEqual({
      page: 2,
      limit: 50,
      status: "PENDING",
      projectId: "project-1",
      assignedToUserId: "user-9",
      search: "hero approval",
    });
  });

  it("normalizes empty approval list responses safely", () => {
    expect(normalizeAdminClientApprovalListResponse({ data: null, meta: null })).toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
});

/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../../features/auth/authTypes";
import type {
  CreateCrmLeadActivityRequest,
  CrmLeadDetail as CrmLeadDetailType,
  UpdateAssignedCrmLeadRequest,
} from "../../../features/crm/crmTypes";
import { CrmLeadDetail } from "../CrmLeadDetail";

type MutationResponse<T> = { unwrap: () => Promise<T> };

const mockUseGetCrmLeadQuery = vi.fn();
const mockUseUpdateCrmLeadMutation = vi.fn<() => [(payload: { id: string; body: UpdateAssignedCrmLeadRequest }) => MutationResponse<unknown>, { isLoading: boolean }]>();
const mockUseCreateCrmLeadActivityMutation = vi.fn<() => [(payload: { id: string; body: CreateCrmLeadActivityRequest }) => MutationResponse<unknown>, { isLoading: boolean }]>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../../features/crm/crmApi", () => ({
  useGetCrmLeadQuery: (...args: unknown[]) => mockUseGetCrmLeadQuery(...args),
  useUpdateCrmLeadMutation: () => mockUseUpdateCrmLeadMutation(),
  useCreateCrmLeadActivityMutation: () => mockUseCreateCrmLeadActivityMutation(),
}));

const crmUser: AuthUserProfile = {
  id: "crm-user-id",
  email: "crm@socialtech.com",
  displayName: "CRM / Satış Uzmanı",
  accountType: "EMPLOYEE",
  role: "CRM_SPECIALIST",
  status: "ACTIVE",
  permissions: ["crm.leads.read.assigned", "crm.leads.update.assigned"],
  clientProfile: null,
};

const lead: CrmLeadDetailType = {
  id: "lead-id",
  companyName: "Atlas Mobilya",
  contactName: "Ayşe Atlas",
  contactEmail: "ayse@example.com",
  phone: null,
  source: "MANUAL",
  status: "NEW",
  ownerUserId: crmUser.id,
  convertedClientProfileId: null,
  nextFollowUpAt: null,
  createdAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-01T09:00:00.000Z",
  owner: {
    id: crmUser.id,
    email: crmUser.email,
    displayName: crmUser.displayName,
    role: "CRM_SPECIALIST",
    status: "ACTIVE",
  },
  convertedClientProfile: null,
  latestActivity: null,
  activities: [],
};

describe("Employee CrmLeadDetail", () => {
  beforeEach(() => {
    currentUser = crmUser;
    mockUseGetCrmLeadQuery.mockReturnValue({
      data: lead,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseUpdateCrmLeadMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => lead })),
      { isLoading: false },
    ]);
    mockUseCreateCrmLeadActivityMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({ id: "activity-id" }) })),
      { isLoading: false },
    ]);
  });

  it("does not render convert/WON UI for CRM employees", () => {
    renderDetail();
    expect(screen.getByText("Atlas Mobilya")).toBeInTheDocument();
    expect(screen.queryByText(/convert/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /won/i })).not.toBeInTheDocument();
  });

  it("submits employee status updates and activity creation", async () => {
    const updateLead = vi.fn(() => ({ unwrap: async () => lead }));
    const createActivity = vi.fn(() => ({ unwrap: async () => ({ id: "activity-id" }) }));
    mockUseUpdateCrmLeadMutation.mockReturnValue([updateLead, { isLoading: false }]);
    mockUseCreateCrmLeadActivityMutation.mockReturnValue([createActivity, { isLoading: false }]);

    renderDetail();
    fireEvent.change(screen.getByLabelText("Durum"), { target: { value: "QUALIFIED" } });
    fireEvent.click(screen.getByRole("button", { name: "Takibi Güncelle" }));
    await waitFor(() => {
      expect(updateLead).toHaveBeenCalledWith({
        id: "lead-id",
        body: { status: "QUALIFIED" },
      });
    });

    fireEvent.change(screen.getByLabelText("Aktivite"), { target: { value: "WHATSAPP" } });
    fireEvent.change(screen.getByLabelText("Not"), { target: { value: "WhatsApp görüşmesi yapıldı" } });
    fireEvent.click(screen.getByRole("button", { name: "Aktivite Ekle" }));
    await waitFor(() => {
      expect(createActivity).toHaveBeenCalledWith({
        id: "lead-id",
        body: { type: "WHATSAPP", note: "WhatsApp görüşmesi yapıldı" },
      });
    });
  });
});

function renderDetail() {
  render(
    <MemoryRouter initialEntries={["/employee/crm/leads/lead-id"]}>
      <Routes>
        <Route path="/employee/crm/leads/:id" element={<CrmLeadDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

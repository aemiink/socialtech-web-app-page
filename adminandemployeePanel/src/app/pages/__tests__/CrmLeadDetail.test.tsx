/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import type {
  ConvertCrmLeadRequest,
  CreateCrmLeadActivityRequest,
  CrmLeadDetail as CrmLeadDetailType,
  UpdateAdminCrmLeadRequest,
} from "../../features/crm/crmTypes";
import { CrmLeadDetail } from "../CrmLeadDetail";

type MutationResponse<T> = { unwrap: () => Promise<T> };

const mockUseGetAdminCrmLeadQuery = vi.fn();
const mockUseUpdateAdminCrmLeadMutation = vi.fn<
  () => [(payload: { id: string; body: UpdateAdminCrmLeadRequest }) => MutationResponse<unknown>, { isLoading: boolean }]
>();
const mockUseCreateAdminCrmLeadActivityMutation = vi.fn<
  () => [(payload: { id: string; body: CreateCrmLeadActivityRequest }) => MutationResponse<unknown>, { isLoading: boolean }]
>();
const mockUseConvertAdminCrmLeadMutation = vi.fn<
  () => [(payload: { id: string; body: ConvertCrmLeadRequest }) => MutationResponse<unknown>, { isLoading: boolean }]
>();

let currentUser: AuthUserProfile | null = null;

vi.mock("../../store/hooks", () => ({
  useAppSelector: () => currentUser,
}));

vi.mock("../../features/crm/crmApi", () => ({
  useGetAdminCrmLeadQuery: (...args: unknown[]) => mockUseGetAdminCrmLeadQuery(...args),
  useUpdateAdminCrmLeadMutation: () => mockUseUpdateAdminCrmLeadMutation(),
  useCreateAdminCrmLeadActivityMutation: () => mockUseCreateAdminCrmLeadActivityMutation(),
  useConvertAdminCrmLeadMutation: () => mockUseConvertAdminCrmLeadMutation(),
}));

const adminUser: AuthUserProfile = {
  id: "admin-user-id",
  email: "admin@socialtech.com",
  displayName: "Admin User",
  accountType: "ADMIN",
  role: "ADMIN",
  status: "ACTIVE",
  permissions: ["crm.leads.read.any", "crm.leads.manage.any", "crm.leads.convert"],
  clientProfile: null,
};

const lead: CrmLeadDetailType = {
  id: "lead-id",
  companyName: "Atlas Mobilya",
  contactName: "Ayşe Atlas",
  contactEmail: "ayse@example.com",
  phone: null,
  source: "MANUAL",
  status: "QUALIFIED",
  ownerUserId: "crm-user-id",
  convertedClientProfileId: null,
  nextFollowUpAt: null,
  createdAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-01T09:00:00.000Z",
  owner: {
    id: "crm-user-id",
    email: "crm@socialtech.com",
    displayName: "CRM / Satış Uzmanı",
    role: "CRM_SPECIALIST",
    status: "ACTIVE",
  },
  convertedClientProfile: null,
  latestActivity: null,
  activities: [],
};

describe("Admin CrmLeadDetail", () => {
  beforeEach(() => {
    currentUser = adminUser;
    mockUseGetAdminCrmLeadQuery.mockReturnValue({
      data: lead,
      error: undefined,
      isError: false,
      isLoading: false,
    });
    mockUseUpdateAdminCrmLeadMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => lead })),
      { isLoading: false },
    ]);
    mockUseCreateAdminCrmLeadActivityMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({ id: "activity-id" }) })),
      { isLoading: false },
    ]);
    mockUseConvertAdminCrmLeadMutation.mockReturnValue([
      vi.fn(() => ({ unwrap: async () => ({ lead, convertedClientProfile: lead.convertedClientProfile }) })),
      { isLoading: false },
    ]);
  });

  it("does not send status when only nextFollowUpAt changed", async () => {
    const updateLead = vi.fn(() => ({ unwrap: async () => lead }));
    mockUseUpdateAdminCrmLeadMutation.mockReturnValue([updateLead, { isLoading: false }]);
    renderDetail();

    fireEvent.change(screen.getByLabelText("Sonraki Takip"), {
      target: { value: "2026-05-03T10:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Güncelle" }));

    await waitFor(() => {
      expect(updateLead).toHaveBeenCalledWith({
        id: "lead-id",
        body: {
          nextFollowUpAt: new Date("2026-05-03T10:30").toISOString(),
        },
      });
    });
  });

  it("creates activity and converts the lead from the admin detail page", async () => {
    const createActivity = vi.fn(() => ({ unwrap: async () => ({ id: "activity-id" }) }));
    const convertLead = vi.fn(() => ({ unwrap: async () => ({ lead, convertedClientProfile: lead.convertedClientProfile }) }));
    mockUseCreateAdminCrmLeadActivityMutation.mockReturnValue([createActivity, { isLoading: false }]);
    mockUseConvertAdminCrmLeadMutation.mockReturnValue([convertLead, { isLoading: false }]);
    renderDetail();

    fireEvent.change(screen.getByLabelText("Not"), { target: { value: "Arama notu" } });
    fireEvent.click(screen.getByRole("button", { name: "Aktivite Ekle" }));
    await waitFor(() => {
      expect(createActivity).toHaveBeenCalledWith({
        id: "lead-id",
        body: { type: "CALL", note: "Arama notu" },
      });
    });

    fireEvent.change(screen.getByLabelText("Müşteri Adı"), { target: { value: "Atlas Client" } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "atlas-client" } });
    fireEvent.click(screen.getByRole("button", { name: "ClientProfile'a Convert Et" }));
    await waitFor(() => {
      expect(convertLead).toHaveBeenCalledWith({
        id: "lead-id",
        body: { clientName: "Atlas Client", slug: "atlas-client" },
      });
    });
  });

  it("shows unauthorized state without read permission", () => {
    currentUser = { ...adminUser, permissions: [] };
    renderDetail();
    expect(screen.getByText(/crm.leads.read.any/)).toBeInTheDocument();
  });
});

function renderDetail() {
  render(
    <MemoryRouter initialEntries={["/crm/lead-id"]}>
      <Routes>
        <Route path="/crm/:id" element={<CrmLeadDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

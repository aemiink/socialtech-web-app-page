/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "../../features/auth/authTypes";
import { EmployeeLayout } from "../EmployeeLayout";

let currentUser: AuthUserProfile | null = null;
let selectedRole: string | null = null;

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: unknown) => {
    const name = typeof selector === "function" ? selector.name : "";
    if (name === "selectCurrentUser") return currentUser;
    if (name === "selectIsAuthenticated") return Boolean(currentUser);
    if (name === "selectIsBootstrapping") return false;
    if (name === "selectCurrentEmployeeRole") return selectedRole;
    return undefined;
  },
}));

vi.mock("../../features/auth/authApi", () => ({
  useLogoutMutation: () => [vi.fn(), { isLoading: false }],
}));

const crmUser: AuthUserProfile = {
  id: "crm-user-id",
  email: "crm@socialtech.com",
  displayName: "CRM / Satış Uzmanı",
  accountType: "EMPLOYEE",
  role: "CRM_SPECIALIST",
  status: "ACTIVE",
  permissions: ["dashboard.read", "crm.leads.read.assigned", "crm.leads.update.assigned", "settings.read"],
  clientProfile: null,
};

describe("EmployeeLayout CRM menu", () => {
  beforeEach(() => {
    currentUser = crmUser;
    selectedRole = "crm-specialist";
  });

  it("shows CRM menu for CRM specialists", () => {
    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.getByText("CRM Leadleri")).toBeInTheDocument();
    expect(screen.getByText("Bugünkü Takipler")).toBeInTheDocument();
  });

  it("does not show CRM menu for non-CRM employees", () => {
    currentUser = { ...crmUser, role: "PERFORMANCE_SPECIALIST" };
    selectedRole = "performance-specialist";
    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.queryByText("CRM Leadleri")).not.toBeInTheDocument();
    expect(screen.queryByText("Bugünkü Takipler")).not.toBeInTheDocument();
  });
});

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

const baseEmployee: AuthUserProfile = {
  id: "employee-1",
  email: "employee@socialtech.com",
  displayName: "Employee",
  accountType: "EMPLOYEE",
  role: "PERFORMANCE_SPECIALIST",
  status: "ACTIVE",
  permissions: ["dashboard.read"],
  clientProfile: null,
};

describe("EmployeeLayout Google Ads menu", () => {
  beforeEach(() => {
    currentUser = baseEmployee;
    selectedRole = "performance-specialist";
  });

  it("shows Google Ads workspace for performance specialist", () => {
    currentUser = { ...baseEmployee, role: "PERFORMANCE_SPECIALIST" };
    selectedRole = "performance-specialist";

    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads Workspace")).toBeInTheDocument();
  });

  it("shows Google Ads workspace for project manager", () => {
    currentUser = { ...baseEmployee, role: "PROJECT_MANAGER" };
    selectedRole = "project-manager";

    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads Workspace")).toBeInTheDocument();
  });

  it("shows Google Ads workspace for designer", () => {
    currentUser = { ...baseEmployee, role: "DESIGNER" };
    selectedRole = "designer";

    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.getByText("Google Ads Workspace")).toBeInTheDocument();
  });

  it("does not show Google Ads workspace for CRM specialist", () => {
    currentUser = { ...baseEmployee, role: "CRM_SPECIALIST" };
    selectedRole = "crm-specialist";

    render(<EmployeeLayout />, { wrapper: MemoryRouter });
    expect(screen.queryByText("Google Ads Workspace")).not.toBeInTheDocument();
  });
});

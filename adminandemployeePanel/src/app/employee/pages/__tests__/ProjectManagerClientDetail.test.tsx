/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectManagerClientDetail } from "../ProjectManagerClientDetail";

const mockCreateProject = vi.fn();

vi.mock("../../../store/hooks", () => ({
  useAppSelector: () => "project-manager",
}));

vi.mock("../../../features/clients/clientsApi", () => ({
  useGetClientSummaryQuery: () => ({
    data: {
      client: { id: "c1", name: "Acme", slug: "acme", status: "ACTIVE" },
      tasks: { recent: [] },
    },
    isLoading: false,
    isError: false,
    error: undefined,
  }),
  useGetClientQuery: () => ({
    data: {
      purchasedServices: [{ serviceKey: "web-app", status: "ACTIVE" }],
    },
  }),
}));

vi.mock("../../../features/projects/projectsApi", () => ({
  useGetProjectsQuery: () => ({ data: { data: [] } }),
  useCreateProjectMutation: () => [mockCreateProject, { isLoading: false }],
}));

describe("ProjectManagerClientDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateProject.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "p1" }),
    });
  });

  it("shows create project action when service has no linked project and submits request", async () => {
    render(
      <MemoryRouter initialEntries={["/employee/project-manager/clients/11111111-1111-4111-8111-111111111111"]}>
        <Routes>
          <Route
            path="/employee/project-manager/clients/:clientId"
            element={<ProjectManagerClientDetail />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Proje Oluştur" }));
    fireEvent.change(screen.getByPlaceholderText("Proje adı"), {
      target: { value: "Web App Operasyon" },
    });
    fireEvent.change(screen.getByPlaceholderText("https://github.com/owner/repo"), {
      target: { value: "https://github.com/acme/web-app" },
    });

    fireEvent.submit(screen.getByPlaceholderText("Proje adı").closest("form")!);

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          clientProfileId: "11111111-1111-4111-8111-111111111111",
          serviceKey: "web-app",
          name: "Web App Operasyon",
        }),
      );
    });
  });
});


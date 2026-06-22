import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeetingsPage } from "../meetings";

const mockCreateRequest = vi.fn();

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: () => null,
}));

vi.mock("../../features/webAppWorkspace/workspaceSocket", () => ({
  createWorkspaceSocket: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock("../../features/webAppWorkspace/webAppWorkspaceApi", () => ({
  webAppWorkspaceApi: {
    util: {
      updateQueryData: vi.fn(),
    },
  },
  useGetClientMeetingRequestsQuery: () => ({
    data: [],
    isLoading: false,
  }),
  useCreateClientMeetingRequestMutation: () => [
    mockCreateRequest,
    { isLoading: false },
  ],
}));

describe("MeetingsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-06-15T08:00:00.000Z"));
    mockCreateRequest.mockReset();
    mockCreateRequest.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "meeting-1" }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows a client without a project to confirm and send a TSİ meeting request", async () => {
    render(<MeetingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Talep Et" }));
    fireEvent.click(screen.getByRole("button", { name: /Genel Görüşme/ }));
    fireEvent.change(screen.getByLabelText("Tarih"), { target: { value: "2026-06-16" } });
    fireEvent.change(screen.getByLabelText("Saat (TSİ)"), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText("Görüşme notu (opsiyonel)"), {
      target: { value: "Sprint ilerlemesini konuşalım." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Talebi Kontrol Et" }));

    expect(mockCreateRequest).not.toHaveBeenCalled();
    expect(screen.getByText("Toplantı talebini gönderelim mi?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Talebi Gönder" }));

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        projectId: undefined,
        title: "[Genel Görüşme] Toplantı Talebi",
        agenda: "Sprint ilerlemesini konuşalım.",
        preferredStartAt: "2026-06-16T07:00:00.000Z",
        preferredEndAt: "2026-06-16T07:45:00.000Z",
        timezone: "Europe/Istanbul",
      });
    });
    expect(screen.getByText("Toplantı talebiniz proje yöneticisine gönderildi.")).toBeInTheDocument();
  });

  it("does not continue when the selected TSİ time is outside 09:00-18:00", () => {
    render(<MeetingsPage projectId="project-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Talep Et" }));
    fireEvent.click(screen.getByRole("button", { name: /Genel Görüşme/ }));
    fireEvent.change(screen.getByLabelText("Tarih"), { target: { value: "2026-06-16" } });
    fireEvent.change(screen.getByLabelText("Saat (TSİ)"), { target: { value: "08:45" } });
    fireEvent.click(screen.getByRole("button", { name: "Talebi Kontrol Et" }));

    expect(screen.getByText("Toplantı saati TSİ 09:00-18:00 arasında olmalıdır.")).toBeInTheDocument();
    expect(screen.queryByText("Toplantı talebini gönderelim mi?")).not.toBeInTheDocument();
    expect(mockCreateRequest).not.toHaveBeenCalled();
  });

  it("does not continue with a past date", () => {
    render(<MeetingsPage projectId="project-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Talep Et" }));
    fireEvent.click(screen.getByRole("button", { name: /Genel Görüşme/ }));
    fireEvent.change(screen.getByLabelText("Tarih"), { target: { value: "2026-06-14" } });
    fireEvent.change(screen.getByLabelText("Saat (TSİ)"), { target: { value: "10:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Talebi Kontrol Et" }));

    expect(screen.getByText("Geçmiş bir tarih için toplantı talebi oluşturamazsınız.")).toBeInTheDocument();
    expect(mockCreateRequest).not.toHaveBeenCalled();
  });
});

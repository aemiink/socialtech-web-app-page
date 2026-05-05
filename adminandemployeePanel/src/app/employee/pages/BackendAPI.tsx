import { DeveloperTasksPage } from "../components/DeveloperTasksPage";

export function BackendAPI() {
  return (
    <DeveloperTasksPage
      title="Backend / API"
      description="Backend ve API geliştirme görevleri"
      query={{ workstream: "BACKEND" }}
    />
  );
}

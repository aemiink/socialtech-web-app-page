import { DeveloperTasksPage } from "../components/DeveloperTasksPage";

export function Frontend() {
  return (
    <DeveloperTasksPage
      title="Frontend"
      description="Frontend geliştirme görevleri"
      query={{ workstream: "FRONTEND" }}
    />
  );
}

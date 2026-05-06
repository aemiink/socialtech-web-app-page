import { DeveloperTasksPage } from "../components/DeveloperTasksPage";

export function UITasarimlar() {
  return (
    <DeveloperTasksPage
      title="UI Tasarımlar"
      description="UI/UX ve tasarım implementasyon görevleri"
      query={{ workstream: "UI_INTEGRATION" }}
    />
  );
}

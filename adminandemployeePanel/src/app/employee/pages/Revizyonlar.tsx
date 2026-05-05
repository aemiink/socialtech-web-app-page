import { DeveloperTasksPage } from "../components/DeveloperTasksPage";

export function Revizyonlar() {
  return (
    <DeveloperTasksPage
      title="Revizyonlar"
      description="Revizyon ve düzenleme odaklı görevler"
      query={{ type: "REVISION" }}
    />
  );
}

import { DeveloperTasksPage } from "../components/DeveloperTasksPage";

export function Buglar() {
  return (
    <DeveloperTasksPage
      title="Buglar"
      description="Hata kayıtları ve çözüm öncelikleri"
      query={{ type: "BUG" }}
      showBugFields
    />
  );
}

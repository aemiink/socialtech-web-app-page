import { useAppSelector } from "../../store/hooks";
import { selectCurrentEmployeeRole } from "../../features/auth/authSelectors";
import { ProjectManagerDashboard } from "./ProjectManagerDashboard";
import { PerformanceSpecialistDashboard } from "./PerformanceSpecialistDashboard";
import { SocialMediaSpecialistDashboard } from "./SocialMediaSpecialistDashboard";
import { DesignerDashboard } from "./DesignerDashboard";
import { DeveloperDashboard } from "./DeveloperDashboard";
import { SupportSpecialistDashboard } from "./SupportSpecialistDashboard";
import { SEOSpecialistDashboard } from "./SEOSpecialistDashboard";

export function EmployeeDashboard() {
  const selectedRole = useAppSelector(selectCurrentEmployeeRole);

  switch (selectedRole) {
    case "project-manager":
      return <ProjectManagerDashboard />;
    case "performance-specialist":
      return <PerformanceSpecialistDashboard />;
    case "social-media-specialist":
      return <SocialMediaSpecialistDashboard />;
    case "designer":
      return <DesignerDashboard />;
    case "developer":
      return <DeveloperDashboard />;
    case "support-specialist":
      return <SupportSpecialistDashboard />;
    case "seo-specialist":
      return <SEOSpecialistDashboard />;
    default:
      return (
        <div className="rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-6">
          <h2 className="text-xl text-white">Çalışan rolü bulunamadı</h2>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Panele erişmek için geçerli bir çalışan hesabıyla giriş yapın.
          </p>
        </div>
      );
  }
}

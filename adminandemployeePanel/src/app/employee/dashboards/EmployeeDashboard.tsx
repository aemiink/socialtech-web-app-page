import { useRole } from "../../contexts/RoleContext";
import { AdminDashboard } from "./AdminDashboard";
import { ProjectManagerDashboard } from "./ProjectManagerDashboard";
import { PerformanceSpecialistDashboard } from "./PerformanceSpecialistDashboard";
import { SocialMediaSpecialistDashboard } from "./SocialMediaSpecialistDashboard";
import { DesignerDashboard } from "./DesignerDashboard";
import { DeveloperDashboard } from "./DeveloperDashboard";
import { SupportSpecialistDashboard } from "./SupportSpecialistDashboard";
import { SEOSpecialistDashboard } from "./SEOSpecialistDashboard";

export function EmployeeDashboard() {
  const { selectedRole } = useRole();

  switch (selectedRole) {
    case "admin":
      return <AdminDashboard />;
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
      return <AdminDashboard />;
  }
}

import type { PageKind } from "./PortfolioPagesHome.shared";
import CareerPage from "./pages/CareerPage";
import CaseStudyPageContent from "./pages/CaseStudyPageContent";
import CaseStudyDetailsPageContent from "./pages/CaseStudyDetailsPageContent";
import CustomersPage from "./pages/CustomersPage";

export default function PortfolioPagesHome({ kind }: { kind: PageKind }) {
  if (kind === "career") return <CareerPage />;
  if (kind === "case-study") return <CaseStudyPageContent />;
  if (kind === "case-detail") return <CaseStudyDetailsPageContent />;
  return <CustomersPage />;
}

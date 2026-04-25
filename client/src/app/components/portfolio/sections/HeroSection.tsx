import type { PageKind } from "../../PortfolioPagesHome.shared";
import { HeroSection as PortfolioHeroSection } from "../../PortfolioPagesHome.shared";

export default function HeroSection({ kind }: { kind: PageKind }) {
  return <PortfolioHeroSection kind={kind} />;
}

import type { TechnicalServicesVariant } from "../../TechnicalServicesHome.shared";
import { PackagesSection as TechnicalPackagesSection } from "../../TechnicalServicesHome.shared";

export default function PackagesSection({ variant }: { variant: TechnicalServicesVariant }) {
  return <TechnicalPackagesSection variant={variant} />;
}

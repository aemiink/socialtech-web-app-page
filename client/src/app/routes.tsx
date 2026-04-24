import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import AboutUsPage from "./pages/AboutUsPage";
import OurServicesPage from "./pages/OurServicesPage";
import OurCustomerPage from "./pages/OurCustomerPage";
import CareerInternPage from "./pages/CareerInternPage";
import CaseStudyPage from "./pages/CaseStudyPage";
import CaseStudyDetailsPage from "./pages/CaseStudyDetailsPage";
import GrowthHubServicesPage from "./pages/GrowthHubServicesPage";
import SocialMediaServicesPage from "./pages/SocialMediaServicesPage";
import WebAppServicesPage from "./pages/WebAppServicesPage";
import MobileAppServicesPage from "./pages/MobileAppServicesPage";
import LandingPageServicesPage from "./pages/LandingPageServicesPage";
import WebDesignServicesPage from "./pages/WebDesignServicesPage";
import DigitalMarketingHubServicesPage from "./pages/DigitalMarketingHubServicesPage";
import MetaAdsServicesPage from "./pages/MetaAdsServicesPage";
import GoogleAdsServicesPage from "./pages/GoogleAdsServicesPage";
import TiktokAdsServicesPage from "./pages/TiktokAdsServicesPage";
import AmazonAdsServicesPage from "./pages/AmazonAdsServicesPage";
import WebTechnicServicesPage from "./pages/WebTechnicServicesPage";
import SeoServicesPage from "./pages/SeoServicesPage";
import ContactPage from "./pages/ContactPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/hakkimizda",
    Component: AboutUsPage,
  },
  {
    path: "/hizmetler",
    Component: OurServicesPage,
  },
  {
    path: "/musteriler",
    Component: OurCustomerPage,
  },
  {
    path: "/iletisim",
    Component: ContactPage,
  },
  {
    path: "/kariyer",
    Component: CareerInternPage,
  },
  {
    path: "/calismalar",
    Component: CaseStudyPage,
  },
  {
    path: "/calisma-detaylari",
    Component: CaseStudyDetailsPage,
  },
  {
    path: "/calismalar/:id",
    Component: CaseStudyDetailsPage,
  },
  {
    path: "/hizmetler/buyume-hub",
    Component: GrowthHubServicesPage,
  },
  {
    path: "/hizmetler/sosyal-medya",
    Component: SocialMediaServicesPage,
  },
  {
    path: "/hizmetler/web-uygulama",
    Component: WebAppServicesPage,
  },
  {
    path: "/hizmetler/mobil-uygulama",
    Component: MobileAppServicesPage,
  },
  {
    path: "/hizmetler/karsilama-sayfasi",
    Component: LandingPageServicesPage,
  },
  {
    path: "/hizmetler/web-tasarim",
    Component: WebDesignServicesPage,
  },
  {
    path: "/hizmetler/dijital-pazarlama-hub",
    Component: DigitalMarketingHubServicesPage,
  },
  {
    path: "/hizmetler/meta-reklamlari",
    Component: MetaAdsServicesPage,
  },
  {
    path: "/hizmetler/google-reklamlari",
    Component: GoogleAdsServicesPage,
  },
  {
    path: "/hizmetler/tiktok-reklamlari",
    Component: TiktokAdsServicesPage,
  },
  {
    path: "/hizmetler/amazon-reklamlari",
    Component: AmazonAdsServicesPage,
  },
  {
    path: "/hizmetler/web-teknik-destek",
    Component: WebTechnicServicesPage,
  },
  {
    path: "/hizmetler/seo",
    Component: SeoServicesPage,
  },
]);

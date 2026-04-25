import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import AppLayout from "./components/layout/AppLayout";

const lazyPage = (loader: () => Promise<{ default: ComponentType }>) => async () => {
  const page = await loader();

  return { Component: page.default };
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import("./pages/LandingPage")),
      },
      {
        path: "hakkimizda",
        lazy: lazyPage(() => import("./pages/AboutUsPage")),
      },
      {
        path: "hizmetler",
        lazy: lazyPage(() => import("./pages/OurServicesPage")),
      },
      {
        path: "musteriler",
        lazy: lazyPage(() => import("./pages/OurCustomerPage")),
      },
      {
        path: "iletisim",
        lazy: lazyPage(() => import("./pages/ContactPage")),
      },
      {
        path: "kariyer",
        lazy: lazyPage(() => import("./pages/CareerInternPage")),
      },
      {
        path: "calismalar",
        lazy: lazyPage(() => import("./pages/CaseStudyPage")),
      },
      {
        path: "calisma-detaylari",
        lazy: lazyPage(() => import("./pages/CaseStudyDetailsPage")),
      },
      {
        path: "calismalar/:id",
        lazy: lazyPage(() => import("./pages/CaseStudyDetailsPage")),
      },
      {
        path: "hizmetler/buyume-hub",
        lazy: lazyPage(() => import("./pages/GrowthHubServicesPage")),
      },
      {
        path: "hizmetler/sosyal-medya",
        lazy: lazyPage(() => import("./pages/SocialMediaServicesPage")),
      },
      {
        path: "hizmetler/web-uygulama",
        lazy: lazyPage(() => import("./pages/WebAppServicesPage")),
      },
      {
        path: "hizmetler/mobil-uygulama",
        lazy: lazyPage(() => import("./pages/MobileAppServicesPage")),
      },
      {
        path: "hizmetler/karsilama-sayfasi",
        lazy: lazyPage(() => import("./pages/LandingPageServicesPage")),
      },
      {
        path: "hizmetler/web-tasarim",
        lazy: lazyPage(() => import("./pages/WebDesignServicesPage")),
      },
      {
        path: "hizmetler/dijital-pazarlama-hub",
        lazy: lazyPage(() => import("./pages/DigitalMarketingHubServicesPage")),
      },
      {
        path: "hizmetler/meta-reklamlari",
        lazy: lazyPage(() => import("./pages/MetaAdsServicesPage")),
      },
      {
        path: "hizmetler/google-reklamlari",
        lazy: lazyPage(() => import("./pages/GoogleAdsServicesPage")),
      },
      {
        path: "hizmetler/tiktok-reklamlari",
        lazy: lazyPage(() => import("./pages/TiktokAdsServicesPage")),
      },
      {
        path: "hizmetler/amazon-reklamlari",
        lazy: lazyPage(() => import("./pages/AmazonAdsServicesPage")),
      },
      {
        path: "hizmetler/web-teknik-destek",
        lazy: lazyPage(() => import("./pages/WebTechnicServicesPage")),
      },
      {
        path: "hizmetler/seo",
        lazy: lazyPage(() => import("./pages/SeoServicesPage")),
      },
    ],
  },
]);

import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router";

type LazyModule = Record<string, unknown>;

function lazyComponent(loader: () => Promise<LazyModule>, exportName: string) {
  return async () => {
    const module = await loader();
    const component = module[exportName];

    if (!component || typeof component !== "function") {
      throw new Error(`Route export '${exportName}' not found`);
    }

    return { Component: component as ComponentType };
  };
}

function LoginRedirect() {
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    lazy: lazyComponent(() => import("./pages/Login"), "Login"),
  },
  {
    path: "/",
    lazy: lazyComponent(() => import("./components/RootLayout"), "RootLayout"),
    children: [
      { index: true, lazy: lazyComponent(() => import("./pages/Dashboard"), "Dashboard") },
      { path: "musteriler", lazy: lazyComponent(() => import("./pages/Clients"), "Clients") },
      { path: "musteriler/:id", lazy: lazyComponent(() => import("./pages/ClientDetail"), "ClientDetail") },
      { path: "crm", lazy: lazyComponent(() => import("./pages/CrmLeads"), "CrmLeads") },
      { path: "crm/:id", lazy: lazyComponent(() => import("./pages/CrmLeadDetail"), "CrmLeadDetail") },
      { path: "hizmetler", lazy: lazyComponent(() => import("./pages/Services"), "Services") },
      { path: "hizmetler/:id", lazy: lazyComponent(() => import("./pages/ServiceDetail"), "ServiceDetail") },
      { path: "projeler", lazy: lazyComponent(() => import("./pages/Projects"), "Projects") },
      { path: "projeler/:id", lazy: lazyComponent(() => import("./pages/ProjectDetail"), "ProjectDetail") },
      { path: "dosyalar", lazy: lazyComponent(() => import("./employee/pages/Dosyalar"), "Dosyalar") },
      { path: "gorevler", lazy: lazyComponent(() => import("./pages/Tasks"), "Tasks") },
      { path: "gorevler/:id", lazy: lazyComponent(() => import("./pages/TaskDetail"), "TaskDetail") },
      { path: "onaylar", lazy: lazyComponent(() => import("./pages/Approvals"), "Approvals") },
      { path: "kampanyalar", lazy: lazyComponent(() => import("./pages/Campaigns"), "Campaigns") },
      { path: "meta-ads", lazy: lazyComponent(() => import("./pages/MetaAdsAdmin"), "MetaAdsAdmin") },
      { path: "tiktok-ads", lazy: lazyComponent(() => import("./pages/TikTokAdsAdmin"), "TikTokAdsAdmin") },
      { path: "amazon-ads", lazy: lazyComponent(() => import("./pages/AmazonAdsAdmin"), "AmazonAdsAdmin") },
      { path: "social-media", lazy: lazyComponent(() => import("./pages/SocialMediaAdmin"), "SocialMediaAdmin") },
      { path: "growth-hub", lazy: lazyComponent(() => import("./pages/GrowthHubAdmin"), "GrowthHubAdmin") },
      { path: "icerikler", lazy: lazyComponent(() => import("./pages/Contents"), "Contents") },
      { path: "raporlar", lazy: lazyComponent(() => import("./pages/Reports"), "Reports") },
      { path: "raporlar/:id", lazy: lazyComponent(() => import("./pages/ReportDetail"), "ReportDetail") },
      { path: "toplantilar", lazy: lazyComponent(() => import("./pages/Meetings"), "Meetings") },
      { path: "calisanlar", lazy: lazyComponent(() => import("./pages/Employees"), "Employees") },
      { path: "calisanlar/atamalar", lazy: lazyComponent(() => import("./pages/EmployeeAssignments"), "EmployeeAssignments") },
      { path: "calisanlar/:id", lazy: lazyComponent(() => import("./pages/EmployeeDetail"), "EmployeeDetail") },
      { path: "audit-loglari", lazy: lazyComponent(() => import("./pages/AuditLogs"), "AuditLogs") },
      { path: "finans", lazy: lazyComponent(() => import("./pages/Finance"), "Finance") },
      { path: "otomasyonlar", lazy: lazyComponent(() => import("./pages/Automations"), "Automations") },
      { path: "ayarlar", lazy: lazyComponent(() => import("./pages/Settings"), "Settings") },
    ],
  },
  {
    path: "/employee/login",
    Component: LoginRedirect,
  },
  {
    path: "/employee",
    lazy: lazyComponent(() => import("./employee/EmployeeLayout"), "EmployeeLayout"),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", lazy: lazyComponent(() => import("./employee/dashboards/EmployeeDashboard"), "EmployeeDashboard") },
      { path: "crm/leads", lazy: lazyComponent(() => import("./employee/pages/CrmLeadlerim"), "CrmLeadlerim") },
      { path: "crm/leads/:id", lazy: lazyComponent(() => import("./employee/pages/CrmLeadDetail"), "CrmLeadDetail") },
      { path: "crm/follow-ups", lazy: lazyComponent(() => import("./employee/pages/BugunkuTakipler"), "BugunkuTakipler") },
      { path: "gorevlerim", lazy: lazyComponent(() => import("./employee/pages/Gorevlerim"), "Gorevlerim") },
      { path: "meta-ads", lazy: lazyComponent(() => import("./employee/pages/MetaAdsCalismaAlani"), "MetaAdsCalismaAlani") },
      { path: "tiktok-ads", lazy: lazyComponent(() => import("./employee/pages/TikTokAdsCalismaAlani"), "TikTokAdsCalismaAlani") },
      { path: "amazon-ads", lazy: lazyComponent(() => import("./employee/pages/AmazonAdsCalismaAlani"), "AmazonAdsCalismaAlani") },
      { path: "social-media", lazy: lazyComponent(() => import("./employee/pages/SocialMediaCalismaAlani"), "SocialMediaCalismaAlani") },
      { path: "web-mobile-design", lazy: lazyComponent(() => import("./employee/pages/WebMobileDesignCalismaAlani"), "WebMobileDesignCalismaAlani") },
      { path: "growth-hub", lazy: lazyComponent(() => import("./employee/pages/GrowthHubCalismaAlani"), "GrowthHubCalismaAlani") },
      { path: "teknik-destek", lazy: lazyComponent(() => import("./employee/pages/TeknikDestekCalismaAlani"), "TeknikDestekCalismaAlani") },
      { path: "seo-audit-calisma", lazy: lazyComponent(() => import("./employee/pages/SEOAuditCalismaAlani"), "SEOAuditCalismaAlani") },
      { path: "gorevlerim/:id", lazy: lazyComponent(() => import("./pages/TaskDetail"), "TaskDetail") },
      { path: "musterilerim", lazy: lazyComponent(() => import("./employee/pages/Musterilerim"), "Musterilerim") },
      { path: "project-manager/clients/:clientId", lazy: lazyComponent(() => import("./employee/pages/ProjectManagerClientDetail"), "ProjectManagerClientDetail") },
      { path: "project-manager/clients/:clientId/services/:serviceKey", lazy: lazyComponent(() => import("./employee/pages/ProjectManagerServiceWorkspace"), "ProjectManagerServiceWorkspace") },
      { path: "takvim", lazy: lazyComponent(() => import("./employee/pages/Takvim"), "Takvim") },
      { path: "bildirimler", lazy: lazyComponent(() => import("./employee/pages/Bildirimler"), "Bildirimler") },
      { path: "dosyalar", lazy: lazyComponent(() => import("./employee/pages/Dosyalar"), "Dosyalar") },
      { path: "ayarlar", lazy: lazyComponent(() => import("./employee/pages/Ayarlar"), "Ayarlar") },
      { path: "projeler", lazy: lazyComponent(() => import("./employee/pages/Projeler"), "Projeler") },
      { path: "projeler/:id", lazy: lazyComponent(() => import("./pages/ProjectDetail"), "ProjectDetail") },
      { path: "onaylar", lazy: lazyComponent(() => import("./employee/pages/Onaylar"), "Onaylar") },
      { path: "teslimatlar", lazy: lazyComponent(() => import("./employee/pages/Teslimatlar"), "Teslimatlar") },
      { path: "toplantilar", lazy: lazyComponent(() => import("./employee/pages/Toplantilar"), "Toplantilar") },
      { path: "rapor-takibi", lazy: lazyComponent(() => import("./employee/pages/RaporTakibi"), "RaporTakibi") },
      { path: "kampanyalar", lazy: lazyComponent(() => import("./employee/pages/Kampanyalar"), "Kampanyalar") },
      { path: "optimizasyonlar", lazy: lazyComponent(() => import("./employee/pages/Optimizasyonlar"), "Optimizasyonlar") },
      { path: "kreatif-talepleri", lazy: lazyComponent(() => import("./employee/pages/KreatifTalepleri"), "KreatifTalepleri") },
      { path: "pixel-tracking", lazy: lazyComponent(() => import("./employee/pages/PixelTracking"), "PixelTracking") },
      { path: "rapor-notlari", lazy: lazyComponent(() => import("./employee/pages/RaporNotlari"), "RaporNotlari") },
      { path: "icerik-takvimi", lazy: lazyComponent(() => import("./employee/pages/IcerikTakvimi"), "IcerikTakvimi") },
      { path: "captionlar", lazy: lazyComponent(() => import("./employee/pages/Captionlar"), "Captionlar") },
      { path: "onay-bekleyenler", lazy: lazyComponent(() => import("./employee/pages/OnayBekleyenler"), "OnayBekleyenler") },
      { path: "yayin-akisi", lazy: lazyComponent(() => import("./employee/pages/YayinAkisi"), "YayinAkisi") },
      { path: "dm-yorumlar", lazy: lazyComponent(() => import("./employee/pages/DmYorumlar"), "DmYorumlar") },
      { path: "trend-notlari", lazy: lazyComponent(() => import("./employee/pages/TrendNotlari"), "TrendNotlari") },
      { path: "kreatifler", lazy: lazyComponent(() => import("./employee/pages/Kreatifler"), "Kreatifler") },
      { path: "ui-tasarimlar", lazy: lazyComponent(() => import("./employee/pages/UITasarimlar"), "UITasarimlar") },
      { path: "revizyonlar", lazy: lazyComponent(() => import("./employee/pages/Revizyonlar"), "Revizyonlar") },
      { path: "teslim-dosyalari", lazy: lazyComponent(() => import("./employee/pages/TeslimDosyalari"), "TeslimDosyalari") },
      { path: "marka-dosyalari", lazy: lazyComponent(() => import("./employee/pages/MarkaDosyalari"), "MarkaDosyalari") },
      { path: "sprintler", lazy: lazyComponent(() => import("./employee/pages/Sprintler"), "Sprintler") },
      { path: "frontend", lazy: lazyComponent(() => import("./employee/pages/Frontend"), "Frontend") },
      { path: "backend-api", lazy: lazyComponent(() => import("./employee/pages/BackendAPI"), "BackendAPI") },
      { path: "buglar", lazy: lazyComponent(() => import("./employee/pages/Buglar"), "Buglar") },
      { path: "test-yayin", lazy: lazyComponent(() => import("./employee/pages/TestYayin"), "TestYayin") },
      { path: "destek-talepleri", lazy: lazyComponent(() => import("./employee/pages/DestekTalepleri"), "DestekTalepleri") },
      { path: "acik-isler", lazy: lazyComponent(() => import("./employee/pages/AcikIsler"), "AcikIsler") },
      { path: "cozulen-isler", lazy: lazyComponent(() => import("./employee/pages/CozulenIsler"), "CozulenIsler") },
      { path: "bakim", lazy: lazyComponent(() => import("./employee/pages/Bakim"), "Bakim") },
      { path: "guvenlik", lazy: lazyComponent(() => import("./employee/pages/Guvenlik"), "Guvenlik") },
      { path: "yedekleme", lazy: lazyComponent(() => import("./employee/pages/Yedekleme"), "Yedekleme") },
      { path: "guncellemeler", lazy: lazyComponent(() => import("./employee/pages/Guncellemeler"), "Guncellemeler") },
      { path: "seo-audit", lazy: lazyComponent(() => import("./employee/pages/SEOAudit"), "SEOAudit") },
      { path: "teknik-hatalar", lazy: lazyComponent(() => import("./employee/pages/TeknikHatalar"), "TeknikHatalar") },
      { path: "anahtar-kelimeler", lazy: lazyComponent(() => import("./employee/pages/AnahtarKelimeler"), "AnahtarKelimeler") },
      { path: "sayfa-hizi", lazy: lazyComponent(() => import("./employee/pages/SayfaHizi"), "SayfaHizi") },
      { path: "index-durumu", lazy: lazyComponent(() => import("./employee/pages/IndexDurumu"), "IndexDurumu") },
      { path: "search-console", lazy: lazyComponent(() => import("./employee/pages/SearchConsole"), "SearchConsole") },
      { path: "aksiyon-plani", lazy: lazyComponent(() => import("./employee/pages/AksiyonPlani"), "AksiyonPlani") },
    ],
  },
]);

import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { ClientDetail } from "./pages/ClientDetail";
import { Services } from "./pages/Services";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Tasks } from "./pages/Tasks";
import { TaskDetail } from "./pages/TaskDetail";
import { Approvals } from "./pages/Approvals";
import { Campaigns } from "./pages/Campaigns";
import { Contents } from "./pages/Contents";
import { Reports } from "./pages/Reports";
import { ReportDetail } from "./pages/ReportDetail";
import { Meetings } from "./pages/Meetings";
import { Employees } from "./pages/Employees";
import { EmployeeDetail } from "./pages/EmployeeDetail";
import { AuditLogs } from "./pages/AuditLogs";
import { Finance } from "./pages/Finance";
import { Automations } from "./pages/Automations";
import { Settings } from "./pages/Settings";

import { EmployeeLayout } from "./employee/EmployeeLayout";
import { EmployeeDashboard } from "./employee/dashboards/EmployeeDashboard";
import { Gorevlerim } from "./employee/pages/Gorevlerim";
import { Musterilerim } from "./employee/pages/Musterilerim";
import { Takvim } from "./employee/pages/Takvim";
import { Bildirimler } from "./employee/pages/Bildirimler";
import { Dosyalar } from "./employee/pages/Dosyalar";
import { Ayarlar } from "./employee/pages/Ayarlar";
import { Projeler as EmployeeProjeler } from "./employee/pages/Projeler";
import { Onaylar } from "./employee/pages/Onaylar";
import { Teslimatlar } from "./employee/pages/Teslimatlar";
import { Toplantilar } from "./employee/pages/Toplantilar";
import { RaporTakibi } from "./employee/pages/RaporTakibi";
import { Kampanyalar as EmployeeKampanyalar } from "./employee/pages/Kampanyalar";
import { Optimizasyonlar } from "./employee/pages/Optimizasyonlar";
import { KreatifTalepleri } from "./employee/pages/KreatifTalepleri";
import { PixelTracking } from "./employee/pages/PixelTracking";
import { RaporNotlari } from "./employee/pages/RaporNotlari";
import { IcerikTakvimi } from "./employee/pages/IcerikTakvimi";
import { Captionlar } from "./employee/pages/Captionlar";
import { OnayBekleyenler } from "./employee/pages/OnayBekleyenler";
import { YayinAkisi } from "./employee/pages/YayinAkisi";
import { DmYorumlar } from "./employee/pages/DmYorumlar";
import { TrendNotlari } from "./employee/pages/TrendNotlari";
import { Kreatifler } from "./employee/pages/Kreatifler";
import { UITasarimlar } from "./employee/pages/UITasarimlar";
import { Revizyonlar } from "./employee/pages/Revizyonlar";
import { TeslimDosyalari } from "./employee/pages/TeslimDosyalari";
import { MarkaDosyalari } from "./employee/pages/MarkaDosyalari";
import { Sprintler } from "./employee/pages/Sprintler";
import { Frontend } from "./employee/pages/Frontend";
import { BackendAPI } from "./employee/pages/BackendAPI";
import { Buglar } from "./employee/pages/Buglar";
import { TestYayin } from "./employee/pages/TestYayin";
import { DestekTalepleri } from "./employee/pages/DestekTalepleri";
import { AcikIsler } from "./employee/pages/AcikIsler";
import { CozulenIsler } from "./employee/pages/CozulenIsler";
import { Bakim } from "./employee/pages/Bakim";
import { Guvenlik } from "./employee/pages/Guvenlik";
import { Yedekleme } from "./employee/pages/Yedekleme";
import { Guncellemeler } from "./employee/pages/Guncellemeler";
import { SEOAudit } from "./employee/pages/SEOAudit";
import { TeknikHatalar } from "./employee/pages/TeknikHatalar";
import { AnahtarKelimeler } from "./employee/pages/AnahtarKelimeler";
import { SayfaHizi } from "./employee/pages/SayfaHizi";
import { IndexDurumu } from "./employee/pages/IndexDurumu";
import { SearchConsole } from "./employee/pages/SearchConsole";
import { AksiyonPlani } from "./employee/pages/AksiyonPlani";

function LoginRedirect() {
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "musteriler", Component: Clients },
      { path: "musteriler/:id", Component: ClientDetail },
      { path: "hizmetler", Component: Services },
      { path: "hizmetler/:id", Component: ServiceDetail },
      { path: "projeler", Component: Projects },
      { path: "projeler/:id", Component: ProjectDetail },
      { path: "gorevler", Component: Tasks },
      { path: "gorevler/:id", Component: TaskDetail },
      { path: "onaylar", Component: Approvals },
      { path: "kampanyalar", Component: Campaigns },
      { path: "icerikler", Component: Contents },
      { path: "raporlar", Component: Reports },
      { path: "raporlar/:id", Component: ReportDetail },
      { path: "toplantilar", Component: Meetings },
      { path: "calisanlar", Component: Employees },
      { path: "calisanlar/:id", Component: EmployeeDetail },
      { path: "audit-loglari", Component: AuditLogs },
      { path: "finans", Component: Finance },
      { path: "otomasyonlar", Component: Automations },
      { path: "ayarlar", Component: Settings },
    ],
  },
  {
    path: "/employee/login",
    Component: LoginRedirect,
  },
  {
    path: "/employee",
    Component: EmployeeLayout,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", Component: EmployeeDashboard },
      { path: "gorevlerim", Component: Gorevlerim },
      { path: "musterilerim", Component: Musterilerim },
      { path: "takvim", Component: Takvim },
      { path: "bildirimler", Component: Bildirimler },
      { path: "dosyalar", Component: Dosyalar },
      { path: "ayarlar", Component: Ayarlar },
      { path: "projeler", Component: EmployeeProjeler },
      { path: "onaylar", Component: Onaylar },
      { path: "teslimatlar", Component: Teslimatlar },
      { path: "toplantilar", Component: Toplantilar },
      { path: "rapor-takibi", Component: RaporTakibi },
      { path: "kampanyalar", Component: EmployeeKampanyalar },
      { path: "optimizasyonlar", Component: Optimizasyonlar },
      { path: "kreatif-talepleri", Component: KreatifTalepleri },
      { path: "pixel-tracking", Component: PixelTracking },
      { path: "rapor-notlari", Component: RaporNotlari },
      { path: "icerik-takvimi", Component: IcerikTakvimi },
      { path: "captionlar", Component: Captionlar },
      { path: "onay-bekleyenler", Component: OnayBekleyenler },
      { path: "yayin-akisi", Component: YayinAkisi },
      { path: "dm-yorumlar", Component: DmYorumlar },
      { path: "trend-notlari", Component: TrendNotlari },
      { path: "kreatifler", Component: Kreatifler },
      { path: "ui-tasarimlar", Component: UITasarimlar },
      { path: "revizyonlar", Component: Revizyonlar },
      { path: "teslim-dosyalari", Component: TeslimDosyalari },
      { path: "marka-dosyalari", Component: MarkaDosyalari },
      { path: "sprintler", Component: Sprintler },
      { path: "frontend", Component: Frontend },
      { path: "backend-api", Component: BackendAPI },
      { path: "buglar", Component: Buglar },
      { path: "test-yayin", Component: TestYayin },
      { path: "destek-talepleri", Component: DestekTalepleri },
      { path: "acik-isler", Component: AcikIsler },
      { path: "cozulen-isler", Component: CozulenIsler },
      { path: "bakim", Component: Bakim },
      { path: "guvenlik", Component: Guvenlik },
      { path: "yedekleme", Component: Yedekleme },
      { path: "guncellemeler", Component: Guncellemeler },
      { path: "seo-audit", Component: SEOAudit },
      { path: "teknik-hatalar", Component: TeknikHatalar },
      { path: "anahtar-kelimeler", Component: AnahtarKelimeler },
      { path: "sayfa-hizi", Component: SayfaHizi },
      { path: "index-durumu", Component: IndexDurumu },
      { path: "search-console", Component: SearchConsole },
      { path: "aksiyon-plani", Component: AksiyonPlani },
    ],
  },
]);

import { Outlet, Link, useLocation, Navigate } from "react-router";
import { useRole, EmployeeRole } from "../contexts/RoleContext";
import {
  LayoutDashboard, CheckSquare, Users, Calendar, Bell, Folder, Settings,
  FileText, ThumbsUp, UserCheck, FolderKanban, TrendingUp, Zap, Image,
  MessageSquare, BookOpen, Code, Bug, Rocket, Headphones, Wrench, Shield,
  Search as SearchIcon, BarChart, Globe, Search, Plus
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

type SidebarItem = {
  path: string;
  label: string;
  icon: any;
};

const roleMenus: Record<EmployeeRole, SidebarItem[]> = {
  admin: [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/onaylar", label: "Onaylar", icon: ThumbsUp },
    { path: "/employee/ekip", label: "Ekip", icon: UserCheck },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  "project-manager": [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/projeler", label: "Projeler", icon: FolderKanban },
    { path: "/employee/onaylar", label: "Onaylar", icon: ThumbsUp },
    { path: "/employee/teslimatlar", label: "Teslimatlar", icon: Rocket },
    { path: "/employee/toplantilar", label: "Toplantılar", icon: Calendar },
    { path: "/employee/rapor-takibi", label: "Rapor Takibi", icon: FileText },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  "performance-specialist": [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/kampanyalar", label: "Kampanyalar", icon: TrendingUp },
    { path: "/employee/optimizasyonlar", label: "Optimizasyonlar", icon: Zap },
    { path: "/employee/kreatif-talepleri", label: "Kreatif Talepleri", icon: Image },
    { path: "/employee/pixel-tracking", label: "Pixel & Tracking", icon: BarChart },
    { path: "/employee/rapor-notlari", label: "Rapor Notları", icon: FileText },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  "social-media-specialist": [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/icerik-takvimi", label: "İçerik Takvimi", icon: Calendar },
    { path: "/employee/captionlar", label: "Captionlar", icon: FileText },
    { path: "/employee/onay-bekleyenler", label: "Onay Bekleyenler", icon: ThumbsUp },
    { path: "/employee/yayin-akisi", label: "Yayın Akışı", icon: Rocket },
    { path: "/employee/dm-yorumlar", label: "DM & Yorumlar", icon: MessageSquare },
    { path: "/employee/trend-notlari", label: "Trend Notları", icon: BookOpen },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  designer: [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/kreatifler", label: "Kreatifler", icon: Image },
    { path: "/employee/ui-tasarimlar", label: "UI Tasarımlar", icon: LayoutDashboard },
    { path: "/employee/revizyonlar", label: "Revizyonlar", icon: FileText },
    { path: "/employee/teslim-dosyalari", label: "Teslim Dosyaları", icon: Rocket },
    { path: "/employee/marka-dosyalari", label: "Marka Dosyaları", icon: Folder },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  developer: [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/sprintler", label: "Sprintler", icon: Zap },
    { path: "/employee/projeler", label: "Projeler", icon: FolderKanban },
    { path: "/employee/frontend", label: "Frontend", icon: Code },
    { path: "/employee/backend-api", label: "Backend / API", icon: Code },
    { path: "/employee/buglar", label: "Buglar", icon: Bug },
    { path: "/employee/test-yayin", label: "Test & Yayın", icon: Rocket },
    { path: "/employee/revizyonlar", label: "Revizyonlar", icon: FileText },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  "support-specialist": [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/destek-talepleri", label: "Destek Talepleri", icon: Headphones },
    { path: "/employee/acik-isler", label: "Açık İşler", icon: FileText },
    { path: "/employee/cozulen-isler", label: "Çözülen İşler", icon: CheckSquare },
    { path: "/employee/bakim", label: "Bakım", icon: Wrench },
    { path: "/employee/guvenlik", label: "Güvenlik", icon: Shield },
    { path: "/employee/yedekleme", label: "Yedekleme", icon: Folder },
    { path: "/employee/guncellemeler", label: "Güncellemeler", icon: Rocket },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
  "seo-specialist": [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/gorevlerim", label: "Görevlerim", icon: CheckSquare },
    { path: "/employee/seo-audit", label: "SEO Audit", icon: SearchIcon },
    { path: "/employee/teknik-hatalar", label: "Teknik Hatalar", icon: Bug },
    { path: "/employee/anahtar-kelimeler", label: "Anahtar Kelimeler", icon: FileText },
    { path: "/employee/sayfa-hizi", label: "Sayfa Hızı", icon: Zap },
    { path: "/employee/index-durumu", label: "Index Durumu", icon: BarChart },
    { path: "/employee/search-console", label: "Search Console", icon: Globe },
    { path: "/employee/aksiyon-plani", label: "Aksiyon Planı", icon: CheckSquare },
    { path: "/employee/musterilerim", label: "Müşterilerim", icon: Users },
    { path: "/employee/takvim", label: "Takvim", icon: Calendar },
    { path: "/employee/bildirimler", label: "Bildirimler", icon: Bell },
    { path: "/employee/dosyalar", label: "Dosyalar", icon: Folder },
    { path: "/employee/ayarlar", label: "Ayarlar", icon: Settings },
  ],
};

const roleNames: Record<EmployeeRole, string> = {
  admin: "Admin",
  "project-manager": "Project Manager",
  "performance-specialist": "Performance Specialist",
  "social-media-specialist": "Social Media Specialist",
  designer: "Designer",
  developer: "Developer",
  "support-specialist": "Support Specialist",
  "seo-specialist": "SEO Specialist",
};

export function EmployeeLayout() {
  const { selectedRole } = useRole();
  const location = useLocation();

  if (!selectedRole) {
    return <Navigate to="/employee/login" replace />;
  }

  const menuItems = roleMenus[selectedRole] || [];

  return (
    <div className="flex h-screen bg-[#131313] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#131313] border-r border-white/[0.06] flex flex-col">
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="text-xl font-semibold">Social Tech</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Çalışan Paneli</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive
                    ? "bg-[#AAFF01] text-[#131313] shadow-[0_0_20px_rgba(170,255,1,0.3)]"
                    : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#131313] border-b border-white/[0.06] flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
              <Input
                type="text"
                placeholder="Ara..."
                className="w-full bg-[#1A1A1A] border-white/[0.06] pl-10 h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className="bg-[#AAFF01] text-[#131313]">{roleNames[selectedRole]}</Badge>

            <div className="text-sm text-[#A0A0A0]">27 Nisan 2026</div>

            <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2 h-9">
              <Plus className="w-4 h-4" />
              Hızlı Aksiyon
            </Button>

            <button className="relative p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#AAFF01] rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
              <Avatar className="w-9 h-9 bg-[#AAFF01] text-[#131313]">
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#131313] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

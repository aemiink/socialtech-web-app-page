import { Outlet, Link, Navigate, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Briefcase, FolderKanban,
  CheckSquare, ThumbsUp, Megaphone, FileText,
  BarChart3, Calendar, UserCheck, DollarSign,
  Zap, Settings, Search, Plus, Bell, LogOut
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRole } from "../contexts/RoleContext";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/musteriler", label: "Müşteriler", icon: Users },
  { path: "/hizmetler", label: "Hizmetler", icon: Briefcase },
  { path: "/projeler", label: "Projeler", icon: FolderKanban },
  { path: "/gorevler", label: "Görevler", icon: CheckSquare },
  { path: "/onaylar", label: "Onaylar", icon: ThumbsUp },
  { path: "/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  { path: "/icerikler", label: "İçerikler", icon: FileText },
  { path: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { path: "/toplantilar", label: "Toplantılar", icon: Calendar },
  { path: "/calisanlar", label: "Çalışanlar", icon: UserCheck },
  { path: "/finans", label: "Finans", icon: DollarSign },
  { path: "/otomasyonlar", label: "Otomasyonlar", icon: Zap },
  { path: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useRole();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (currentUser.accountType !== "admin") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#131313] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#131313] border-r border-white/[0.06] flex flex-col">
        <div className="p-6 border-b border-white/[0.06]">
          <h1 className="text-xl font-semibold">Social Tech</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Admin Panel</p>
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
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
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
            <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
              <Plus className="w-4 h-4" />
              Yeni Oluştur
            </Button>

            <button className="relative p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#AAFF01] rounded-full" />
            </button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-9 rounded-lg text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
              <div className="text-right">
                <p className="text-sm">{currentUser.name}</p>
                <p className="text-xs text-[#A0A0A0]">{currentUser.title}</p>
              </div>
              <Avatar className="w-9 h-9 bg-[#AAFF01] text-[#131313]">
                <AvatarFallback>{currentUser.initials}</AvatarFallback>
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

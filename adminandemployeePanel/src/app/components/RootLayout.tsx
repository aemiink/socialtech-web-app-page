import { Outlet, Link, Navigate, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Briefcase, FolderKanban,
  CheckSquare, ThumbsUp, Megaphone, FileText,
  BarChart3, Calendar, UserCheck, DollarSign, Folder,
  Zap, Settings, Search, Plus, Bell, LogOut, History, UserCog, PhoneCall
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useLogoutMutation } from "../features/auth/authApi";
import { clearAuth } from "../features/auth/authSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsBootstrapping,
} from "../features/auth/authSelectors";
import { getUserDisplayName, getUserInitials } from "../features/auth/roleMapping";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/musteriler", label: "Müşteriler", icon: Users },
  { path: "/crm", label: "CRM", icon: PhoneCall },
  { path: "/hizmetler", label: "Hizmetler", icon: Briefcase },
  { path: "/projeler", label: "Projeler", icon: FolderKanban },
  { path: "/dosyalar", label: "Dosyalar", icon: Folder },
  { path: "/gorevler", label: "Görevler", icon: CheckSquare },
  { path: "/onaylar", label: "Onaylar", icon: ThumbsUp },
  { path: "/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  { path: "/icerikler", label: "İçerikler", icon: FileText },
  { path: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { path: "/toplantilar", label: "Toplantılar", icon: Calendar },
  { path: "/calisanlar", label: "Çalışanlar", icon: UserCheck },
  { path: "/calisanlar/atamalar", label: "Atamalar", icon: UserCog },
  { path: "/audit-loglari", label: "İşlem Geçmişi", icon: History },
  { path: "/finans", label: "Finans", icon: DollarSign },
  { path: "/otomasyonlar", label: "Otomasyonlar", icon: Zap },
  { path: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export function RootLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBootstrapping = useAppSelector(selectIsBootstrapping);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center p-6">
        <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-6 py-4 text-sm text-[#A0A0A0]">
          Yetki kontrol ediliyor...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (currentUser.accountType === "EMPLOYEE") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (currentUser.accountType !== "ADMIN" || currentUser.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Local state cleanup is still required even if backend logout fails.
    } finally {
      dispatch(clearAuth());
      navigate("/login", { replace: true });
    }
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

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isMenuItemActive(item.path, location.pathname)
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
              disabled={isLoggingOut}
              className="h-9 rounded-lg text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </Button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.06]">
              <div className="text-right">
                <p className="text-sm">{displayName}</p>
                <p className="text-xs text-[#A0A0A0]">Yönetici</p>
              </div>
              <Avatar className="w-9 h-9 bg-[#AAFF01] text-[#131313]">
                <AvatarFallback>{initials}</AvatarFallback>
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

function isMenuItemActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === "/") {
    return currentPath === "/";
  }

  if (itemPath === "/calisanlar" && currentPath === "/calisanlar/atamalar") {
    return false;
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

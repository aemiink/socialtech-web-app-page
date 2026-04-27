import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useRole, EmployeeRole } from "../contexts/RoleContext";
import {
  Shield, Briefcase, TrendingUp, MessageSquare,
  Palette, Code, Headphones, Search
} from "lucide-react";

const roles = [
  {
    id: "admin" as EmployeeRole,
    name: "Admin",
    description: "Tüm operasyon, müşteri, çalışan ve finans görünümü",
    icon: Shield,
    accessLevel: "Full Access",
    color: "from-[#AAFF01] to-[#88CC00]"
  },
  {
    id: "project-manager" as EmployeeRole,
    name: "Project Manager",
    description: "Müşteri süreçleri, görev takibi, onaylar ve teslimatlar",
    icon: Briefcase,
    accessLevel: "Management",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "performance-specialist" as EmployeeRole,
    name: "Performance Specialist",
    description: "Reklam kampanyaları, optimizasyonlar ve performans notları",
    icon: TrendingUp,
    accessLevel: "Specialist",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "social-media-specialist" as EmployeeRole,
    name: "Social Media Specialist",
    description: "İçerik takvimi, caption, DM/yorum ve yayın akışı",
    icon: MessageSquare,
    accessLevel: "Specialist",
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "designer" as EmployeeRole,
    name: "Designer",
    description: "Tasarım görevleri, kreatifler, UI ekranları ve revizyonlar",
    icon: Palette,
    accessLevel: "Specialist",
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "developer" as EmployeeRole,
    name: "Developer",
    description: "Web/app geliştirme, teknik görevler, sprint ve test süreçleri",
    icon: Code,
    accessLevel: "Specialist",
    color: "from-cyan-500 to-cyan-600"
  },
  {
    id: "support-specialist" as EmployeeRole,
    name: "Support Specialist",
    description: "Destek talepleri, bakım, güvenlik ve teknik aksiyonlar",
    icon: Headphones,
    accessLevel: "Specialist",
    color: "from-green-500 to-green-600"
  },
  {
    id: "seo-specialist" as EmployeeRole,
    name: "SEO Specialist",
    description: "SEO audit, teknik hatalar, keywordler ve aksiyon planı",
    icon: Search,
    accessLevel: "Specialist",
    color: "from-indigo-500 to-indigo-600"
  },
];

export function RoleAccessLogin() {
  const [selected, setSelected] = useState<EmployeeRole | null>(null);
  const { setSelectedRole } = useRole();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selected) {
      setSelectedRole(selected);
      navigate("/employee/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-2xl bg-[#AAFF01]/10 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#AAFF01] to-[#88CC00] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#131313]">ST</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">Social Tech Çalışan Paneli</h1>
          <p className="text-[#A0A0A0] text-lg">Rolünüzü seçerek çalışma alanınıza devam edin</p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;

            return (
              <Card
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`cursor-pointer transition-all p-6 ${
                  isSelected
                    ? "bg-[#1A1A1A] border-[#AAFF01] shadow-[0_0_20px_rgba(170,255,1,0.3)]"
                    : "bg-[#1A1A1A] border-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{role.name}</h3>
                <p className="text-sm text-[#A0A0A0] mb-4 min-h-[60px]">{role.description}</p>
                <Badge variant="outline" className="text-xs">
                  {role.accessLevel}
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleContinue}
            disabled={!selected}
            className="w-full max-w-md h-14 text-lg bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selected ? `${roles.find(r => r.id === selected)?.name} olarak Devam Et` : "Rol Seçin"}
          </Button>
          <p className="text-xs text-[#A0A0A0] text-center max-w-md">
            Bu ekran şimdilik demo Role Access seçimi için tasarlanmıştır.
          </p>
        </div>
      </div>
    </div>
  );
}

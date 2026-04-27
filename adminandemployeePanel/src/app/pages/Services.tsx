import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { TrendingUp, Users, DollarSign, Clock, Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";

const services = [
  { id: "1", name: "Growth & Hub", category: "Growth", clients: 12, revenue: "₺145K", tasks: 24, delayedTasks: 2, team: "Strategy" },
  { id: "2", name: "Sosyal Medya Yönetimi", category: "Social", clients: 28, revenue: "₺186K", tasks: 45, delayedTasks: 4, team: "Social" },
  { id: "13", name: "Medya Hub", category: "Growth", clients: 7, revenue: "₺52K", tasks: 19, delayedTasks: 1, team: "Strategy" },
  { id: "3", name: "Meta ADS", category: "Ads", clients: 19, revenue: "₺98K", tasks: 32, delayedTasks: 3, team: "Performance" },
  { id: "4", name: "Google ADS", category: "Ads", clients: 15, revenue: "₺87K", tasks: 28, delayedTasks: 2, team: "Performance" },
  { id: "5", name: "TikTok ADS", category: "Ads", clients: 8, revenue: "₺42K", tasks: 16, delayedTasks: 1, team: "Performance" },
  { id: "6", name: "Amazon ADS", category: "Ads", clients: 5, revenue: "₺28K", tasks: 12, delayedTasks: 0, team: "Performance" },
  { id: "7", name: "Web APP", category: "Development", clients: 6, revenue: "₺124K", tasks: 35, delayedTasks: 5, team: "Development" },
  { id: "8", name: "Mobil APP", category: "Development", clients: 4, revenue: "₺96K", tasks: 28, delayedTasks: 3, team: "Development" },
  { id: "9", name: "Landing Pages", category: "Development", clients: 14, revenue: "₺72K", tasks: 22, delayedTasks: 2, team: "Development" },
  { id: "10", name: "Web & Mobil Tasarımlar", category: "Design", clients: 11, revenue: "₺65K", tasks: 31, delayedTasks: 2, team: "Design" },
  { id: "11", name: "Teknik Destek", category: "Support", clients: 22, revenue: "₺48K", tasks: 18, delayedTasks: 1, team: "Support" },
  { id: "12", name: "SEO Denetimi", category: "SEO", clients: 9, revenue: "₺38K", tasks: 14, delayedTasks: 1, team: "SEO" },
];

const categoryColors: Record<string, string> = {
  Growth: "bg-purple-500/20 text-purple-400",
  Social: "bg-blue-500/20 text-blue-400",
  Ads: "bg-[#AAFF01]/20 text-[#AAFF01]",
  Development: "bg-cyan-500/20 text-cyan-400",
  Design: "bg-pink-500/20 text-pink-400",
  Support: "bg-orange-500/20 text-orange-400",
  SEO: "bg-green-500/20 text-green-400",
};

export function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Hizmetler</h1>
          <p className="text-[#A0A0A0]">Social Tech hizmet portföyü</p>
        </div>
        <Button className="bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90 gap-2">
          <Plus className="w-4 h-4" />
          Yeni Hizmet Ekle
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">En Çok Talep Edilen</span>
          </div>
          <div className="text-lg font-semibold">Sosyal Medya</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">En Yüksek Gelir</span>
          </div>
          <div className="text-lg font-semibold">Sosyal Medya</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">En Gecikmeli</span>
          </div>
          <div className="text-lg font-semibold">Web APP</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Toplam Müşteri</span>
          </div>
          <div className="text-lg font-semibold">160</div>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "bg-[#AAFF01] text-[#131313]" : ""}
        >
          Tümü ({services.length})
        </Button>
        {["Growth", "Social", "Ads", "Development", "Design", "Support", "SEO"].map((cat) => {
          const count = services.filter(s => s.category === cat).length;
          return (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-[#AAFF01] text-[#131313]" : ""}
            >
              {cat} ({count})
            </Button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <Link key={service.id} to={`/hizmetler/${service.id}`}>
            <Card className="bg-[#1A1A1A] border-white/[0.06] p-5 hover:bg-[#202020] transition-colors h-full">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold">{service.name}</h3>
                <Badge className={categoryColors[service.category]}>{service.category}</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Aktif Müşteri</span>
                  <span className="font-medium">{service.clients}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Aylık Gelir</span>
                  <span className="font-medium text-[#AAFF01]">{service.revenue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Açık Görev</span>
                  <span className="font-medium">{service.tasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Geciken Görev</span>
                  <span className={`font-medium ${service.delayedTasks > 0 ? 'text-red-500' : 'text-[#AAFF01]'}`}>
                    {service.delayedTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Sorumlu Ekip</span>
                  <span className="font-medium">{service.team}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

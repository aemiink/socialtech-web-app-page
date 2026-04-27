import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Image, LayoutDashboard, FileText, Rocket, Folder, Clock, AlertCircle, CheckSquare } from "lucide-react";

export function DesignerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Designer Dashboard</h1>
        <p className="text-[#A0A0A0]">Tasarım yönetimi ve kreatif üretim</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Image className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Aktif Kreatif</span>
          </div>
          <div className="text-2xl font-semibold">12</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-[#A0A0A0]">Revizyon</span>
          </div>
          <div className="text-2xl font-semibold text-orange-500">5</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-sm text-[#A0A0A0]">Bugün Teslim</span>
          </div>
          <div className="text-2xl font-semibold text-red-500">3</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Teslim Edildi</span>
          </div>
          <div className="text-2xl font-semibold">8</div>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="w-5 h-5 text-[#AAFF01]" />
            <span className="text-sm text-[#A0A0A0]">Bu Ay Tamamlanan</span>
          </div>
          <div className="text-2xl font-semibold">34</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Öncelikli Tasarımlar</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", type: "Meta ADS Kreatif", format: "1080x1920", count: 5, deadline: "Bugün 18:00", priority: "urgent" },
              { client: "ABC Corp", type: "Landing Page", format: "Desktop + Mobile", count: 1, deadline: "Yarın", priority: "high" },
              { client: "DEF Medya", type: "Social Media Carousel", format: "1080x1080", count: 8, deadline: "29 Nisan", priority: "normal" },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border ${item.priority === 'urgent' ? 'bg-red-500/10 border-red-500/30' : item.priority === 'high' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/[0.06]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{item.client}</h4>
                    <p className="text-xs text-[#A0A0A0]">{item.type}</p>
                  </div>
                  <Badge variant={item.priority === 'urgent' ? 'destructive' : item.priority === 'high' ? 'default' : 'outline'} className="text-xs">
                    {item.count} tasarım
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A0A0A0]">{item.format}</span>
                  <span className={item.priority === 'urgent' ? 'text-red-500' : 'text-[#AAFF01]'}>{item.deadline}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90">Tasarıma Başla</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <h3 className="text-lg font-semibold mb-4">Revizyon Talepleri</h3>
          <div className="space-y-3">
            {[
              { client: "XYZ Holding", project: "Instagram Reel kapak görseli", revision: "Logo boyutu büyütülecek", round: 2, waiting: "3 saat" },
              { client: "ABC Corp", project: "Web banner tasarımı", revision: "CTA button rengi değişecek", round: 1, waiting: "1 gün" },
              { client: "DEF Medya", project: "Product mockup", revision: "Arka plan değişikliği", round: 3, waiting: "2 gün" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.client}</h4>
                  <Badge variant="secondary" className="text-xs">R{item.round}</Badge>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">{item.project}</p>
                <p className="text-sm mb-2">{item.revision}</p>
                <p className="text-xs text-orange-500">Bekleme: {item.waiting}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">UI Tasarım Projeleri</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "ABC Corp", project: "E-commerce Web APP", progress: 60, screens: "12/20 ekran" },
              { client: "GHI Teknoloji", project: "Mobil APP Redesign", progress: 35, screens: "7/15 ekran" },
            ].map((ui, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{ui.client}</p>
                  <span className="text-xs text-[#AAFF01]">{ui.progress}%</span>
                </div>
                <p className="text-xs text-[#A0A0A0] mb-2">{ui.project}</p>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-[#AAFF01] h-1.5 rounded-full" style={{ width: `${ui.progress}%` }} />
                </div>
                <p className="text-xs text-[#A0A0A0] mt-1">{ui.screens}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Projelere Git</Button>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Marka Dosyaları</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", files: "Logo, Renkler, Fontlar", updated: "2 gün önce" },
              { client: "ABC Corp", files: "Brand Guidelines", updated: "1 hafta önce" },
              { client: "DEF Medya", files: "Logo Varyasyonları", updated: "3 gün önce" },
            ].map((brand, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <p className="text-sm font-medium mb-1">{brand.client}</p>
                <p className="text-xs text-[#A0A0A0] mb-1">{brand.files}</p>
                <p className="text-xs text-[#AAFF01]">{brand.updated}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Teslim Dosyaları</h3>
          </div>
          <div className="space-y-2">
            {[
              { client: "XYZ Holding", files: "5 Meta ADS kreatif", status: "Müşteri onayı bekleniyor", date: "27 Nisan" },
              { client: "ABC Corp", files: "Landing page export", status: "Developer'a teslim edildi", date: "26 Nisan" },
            ].map((delivery, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5">
                <p className="text-sm font-medium mb-1">{delivery.client}</p>
                <p className="text-xs text-[#A0A0A0] mb-2">{delivery.files}</p>
                <Badge variant="outline" className="text-xs mb-1">{delivery.status}</Badge>
                <p className="text-xs text-[#AAFF01]">{delivery.date}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Tüm Teslimler</Button>
        </Card>
      </div>
    </div>
  );
}
